from flask import Flask, request, jsonify
from flask_cors import CORS
from googleapiclient.errors import HttpError
import os
from dotenv import load_dotenv

# サービスのインポート
from services.youtube_service import YouTubeService
from services.gemini_service import GeminiService
from services.auth_service import initialize_firebase, auth_required

# 環境変数の読み込み
load_dotenv()

app = Flask(__name__)

# CORSの設定
CORS_ORIGIN = os.getenv('CORS_ORIGIN', 'http://localhost:3000')
CORS(app, resources={r"/api/*": {"origins": CORS_ORIGIN}})

# 環境変数からYouTube APIキーを取得
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

# サービスインスタンスの作成
youtube_service = YouTubeService(YOUTUBE_API_KEY)
gemini_service = GeminiService()

# Firebase Admin SDKの初期化
firebase_initialized = initialize_firebase()
if not firebase_initialized:
    print("警告: Firebase Admin SDKの初期化に失敗しました")


@app.route('/api/search', methods=['POST'])
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


@app.route('/api/summarize', methods=['POST'])
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


@app.route('/api/auth/verify', methods=['POST'])
@auth_required
def verify_auth():
    """
    認証トークンを検証し、ユーザー情報を返します。
    このエンドポイントはauth_requiredデコレータで保護されています。
    
    戻り値:
    - デコードされたトークンからのユーザー情報を含むJSONレスポンス
    """
    # auth_requiredデコレータがデコードされたトークンをrequest.userに追加します
    user_info = request.user
    
    # ユーザー情報を返す
    return jsonify({
        'authenticated': True,
        'user': {
            'uid': user_info.get('uid'),
            'email': user_info.get('email'),
            'email_verified': user_info.get('email_verified', False),
            'auth_time': user_info.get('auth_time')
        }
    })


@app.route('/')
def index():
    """APIが実行中であることを確認するための簡単なインデックスルート。"""
    return jsonify({
        'message': 'YouTube検索と要約APIが実行中です',
        'endpoints': {
            'search': '/api/search (JSONボディを持つPOST)',
            'summarize': '/api/summarize (JSONボディを持つPOST)',
            'auth_verify': '/api/auth/verify (Authorizationヘッダーを持つPOST)'
        }
    })


if __name__ == '__main__':
    # APIキーが設定されているかチェック
    if not YOUTUBE_API_KEY:
        print("警告: YOUTUBE_API_KEYが.envファイルに設定されていません")
    
    # Flaskアプリを実行
    app.run(debug=True)
