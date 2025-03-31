from flask import Blueprint, jsonify

# Blueprintを作成
main_bp = Blueprint('main_bp', __name__)

@main_bp.route('/')
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
