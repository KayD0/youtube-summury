from flask import Blueprint, request, jsonify
from services.auth_service import auth_required

# Blueprintを作成
auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api/auth')

@auth_bp.route('/verify', methods=['POST'])
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
