"""
Firebase認証サービス - IDトークンの検証用
"""
import os
import firebase_admin
from firebase_admin import credentials, auth
from functools import wraps
from flask import request, jsonify

# Firebase Admin SDKの初期化
def initialize_firebase():
    """環境変数からの認証情報を使用してFirebase Admin SDKを初期化する"""
    try:
        # 既に初期化されているかチェック
        if not firebase_admin._apps:
            # 環境変数からサービスアカウント認証情報を使用
            if os.getenv('FIREBASE_PROJECT_ID'):
                cred_dict = {
                    "type": "service_account",
                    "project_id": os.getenv('FIREBASE_PROJECT_ID'),
                    "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
                    "private_key": os.getenv('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
                    "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
                    "client_id": os.getenv('FIREBASE_CLIENT_ID'),
                    "auth_uri": os.getenv('FIREBASE_AUTH_URI'),
                    "token_uri": os.getenv('FIREBASE_TOKEN_URI'),
                    "auth_provider_x509_cert_url": os.getenv('FIREBASE_AUTH_PROVIDER_X509_CERT_URL'),
                    "client_x509_cert_url": os.getenv('FIREBASE_CLIENT_X509_CERT_URL')
                }
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                print("Firebase Admin SDKがサービスアカウント認証情報で初期化されました")
            else:
                # サービスアカウントが提供されていない場合はアプリケーションのデフォルト認証情報を使用
                firebase_admin.initialize_app()
                print("Firebase Admin SDKがアプリケーションのデフォルト認証情報で初期化されました")
        return True
    except Exception as e:
        print(f"Firebase Admin SDKの初期化エラー: {str(e)}")
        return False

# 認証が必要なルートのためのデコレータ
def auth_required(f):
    """
    Firebase認証を必要とするFlaskルートのためのデコレータ。
    AuthorizationヘッダーのIDトークンを検証し、デコードされたトークンをリクエストに追加します。
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # リクエストヘッダーから認証トークンを取得
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Authorizationヘッダーがありません'}), 401
        
        # トークンを抽出（'Bearer 'プレフィックスがある場合は削除）
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
        
        try:
            # トークンを検証
            decoded_token = auth.verify_id_token(token)
            
            # デコードされたトークンをリクエストオブジェクトに追加
            request.user = decoded_token
            
            # ルート関数を続行
            return f(*args, **kwargs)
        except auth.InvalidIdTokenError:
            return jsonify({'error': '無効な認証トークンです'}), 401
        except auth.ExpiredIdTokenError:
            return jsonify({'error': '期限切れの認証トークンです'}), 401
        except auth.RevokedIdTokenError:
            return jsonify({'error': '取り消された認証トークンです'}), 401
        except auth.CertificateFetchError:
            return jsonify({'error': '証明書の取得エラー'}), 500
        except Exception as e:
            return jsonify({'error': f'認証エラー: {str(e)}'}), 500
    
    return decorated_function

# デコレータなしでトークンを検証する関数（テストまたはカスタム処理用）
def verify_token(token):
    """
    Firebase IDトークンを検証し、有効な場合はデコードされたトークンを返します。
    
    引数:
        token (str): 検証するFirebase IDトークン
        
    戻り値:
        dict: 有効な場合のデコードされたトークン
        
    例外:
        トークンが無効な場合、様々なfirebase_admin.auth例外が発生します
    """
    return auth.verify_id_token(token)
