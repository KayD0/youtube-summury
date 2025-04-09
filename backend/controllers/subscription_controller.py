from flask import Blueprint, request, jsonify
from services.auth_service import auth_required, get_user_id_from_token
from models.channel_subscription import ChannelSubscription
from services.db_service import db
from services.youtube_service import YouTubeService
import os

# 環境変数からYouTube APIキーを取得
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')
youtube_service = YouTubeService(YOUTUBE_API_KEY)

# Blueprintを作成
subscription_bp = Blueprint('subscription_bp', __name__, url_prefix='/api/subscriptions')

@subscription_bp.route('/', methods=['GET'])
@auth_required
def get_subscriptions():
    """
    ユーザーのチャンネル登録一覧を取得します。
    
    戻り値:
    - チャンネル登録情報を含むJSONレスポンス
    """
    try:
        # トークンからユーザーIDを取得
        user_id = get_user_id_from_token()
        
        # ユーザーのチャンネル登録を取得
        subscriptions = ChannelSubscription.query.filter_by(user_id=user_id).all()
        
        # 結果を辞書のリストに変換
        result = [subscription.to_dict() for subscription in subscriptions]
        
        return jsonify({
            'subscriptions': result,
            'count': len(result)
        })
    
    except Exception as e:
        return jsonify({'error': f'チャンネル登録の取得に失敗しました: {str(e)}'}), 500

@subscription_bp.route('/', methods=['POST'])
@auth_required
def subscribe_channel():
    """
    チャンネルを登録します。
    
    JSONボディパラメータ:
    - channel_id: YouTubeチャンネルID（必須）
    
    戻り値:
    - 登録結果を含むJSONレスポンス
    """
    # リクエストボディからJSONデータを取得
    data = request.get_json()
    
    # JSONからパラメータを抽出
    channel_id = data.get('channel_id')
    
    # パラメータの検証
    if not channel_id:
        return jsonify({'error': 'channel_idパラメータがありません'}), 400
    
    try:
        # トークンからユーザーIDを取得
        user_id = get_user_id_from_token()
        
        # チャンネル情報をYouTube APIから取得
        channel_info = youtube_service.get_channel_info(channel_id)
        
        if not channel_info:
            return jsonify({'error': 'チャンネル情報の取得に失敗しました'}), 404
        
        # 既存の登録をチェック
        existing = ChannelSubscription.query.filter_by(
            user_id=user_id, 
            channel_id=channel_id
        ).first()
        
        if existing:
            return jsonify({
                'message': 'このチャンネルは既に登録されています',
                'subscription': existing.to_dict()
            }), 200
        
        # 新しいチャンネル登録を作成
        subscription = ChannelSubscription(
            user_id=user_id,
            channel_id=channel_id,
            channel_title=channel_info.get('title', '不明なチャンネル'),
            channel_thumbnail=channel_info.get('thumbnail', None)
        )
        
        # データベースに保存
        db.session.add(subscription)
        db.session.commit()
        
        return jsonify({
            'message': 'チャンネルを登録しました',
            'subscription': subscription.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'チャンネル登録に失敗しました: {str(e)}'}), 500

@subscription_bp.route('/<channel_id>', methods=['DELETE'])
@auth_required
def unsubscribe_channel(channel_id):
    """
    チャンネル登録を解除します。
    
    URLパラメータ:
    - channel_id: 登録解除するYouTubeチャンネルID
    
    戻り値:
    - 登録解除結果を含むJSONレスポンス
    """
    try:
        # トークンからユーザーIDを取得
        user_id = get_user_id_from_token()
        
        # 登録を検索
        subscription = ChannelSubscription.query.filter_by(
            user_id=user_id, 
            channel_id=channel_id
        ).first()
        
        if not subscription:
            return jsonify({'error': 'チャンネル登録が見つかりません'}), 404
        
        # 登録を削除
        db.session.delete(subscription)
        db.session.commit()
        
        return jsonify({
            'message': 'チャンネル登録を解除しました',
            'channel_id': channel_id
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'チャンネル登録解除に失敗しました: {str(e)}'}), 500
