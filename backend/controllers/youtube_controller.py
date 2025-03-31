from flask import Blueprint, request, jsonify
from googleapiclient.errors import HttpError
import os
from services.auth_service import auth_required
from services.youtube_service import YouTubeService
from services.gemini_service import GeminiService

# 環境変数からYouTube APIキーを取得
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

# サービスインスタンスをコントローラー内で初期化
youtube_service = YouTubeService(YOUTUBE_API_KEY)
gemini_service = GeminiService()

# Blueprintを作成
youtube_bp = Blueprint('youtube_bp', __name__, url_prefix='/api')

@youtube_bp.route('/search', methods=['POST'])
@auth_required
def search_videos():
    """
    キーワードに基づいてYouTubeビデオを検索します。
    
    JSONボディパラメータ:
    - q: 検索クエリ（必須）
    - max_results: 返す結果の最大数（オプション、デフォルト: 10）
    - channel_id: チャンネルIDでフィルタリング（オプション）
    - published_after: この日付以降に公開されたビデオでフィルタリング（オプション、ISO 8601形式）
    
    戻り値:
    - ビデオ情報を含むJSONレスポンス
    """
    # リクエストボディからJSONデータを取得
    data = request.get_json()
    
    # JSONからパラメータを抽出
    query = data.get('q')
    max_results = data.get('max_results', 10)
    channel_id = data.get('channel_id')
    published_after = data.get('published_after')
    
    # クエリパラメータの検証
    if not query:
        return jsonify({'error': 'クエリパラメータ(q)がありません'}), 400
    
    try:
        # サービスを使用してビデオを検索
        result = youtube_service.search_videos(
            query=query,
            max_results=max_results,
            channel_id=channel_id,
            published_after=published_after
        )
        
        return jsonify(result)
    
    except HttpError as e:
        return jsonify({'error': f'YouTube APIエラー: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'サーバーエラー: {str(e)}'}), 500

@youtube_bp.route('/summarize', methods=['POST'])
@auth_required
def summarize_video():
    """
    Vertex AI Geminiを使用してYouTubeビデオの要約を生成します。
    
    JSONボディパラメータ:
    - video_id: YouTubeビデオID（必須）
    
    戻り値:
    - 要約情報を含むJSONレスポンス
    """
    # リクエストボディからJSONデータを取得
    data = request.get_json()
    
    # JSONからパラメータを抽出
    video_id = data.get('video_id')
    
    # video_idパラメータの検証
    if not video_id:
        return jsonify({'error': 'video_idパラメータがありません'}), 400
    
    try:
        # Geminiサービスを使用して要約を生成
        result = gemini_service.generate_summary(video_id, youtube_service)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': f'要約生成エラー: {str(e)}'}), 500
