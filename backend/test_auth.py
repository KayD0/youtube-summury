"""
Firebase認証検証のためのテストスクリプト
"""
import requests
import json
import sys
import os
from dotenv import load_dotenv

# 環境変数の読み込み
load_dotenv()

# APIベースURL
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5000')

def test_auth_verification(token=None):
    """
    認証検証エンドポイントをテストします
    
    引数:
        token (str, オプション): 認証に使用するFirebase IDトークン
    """
    if not token:
        print("トークンが提供されていません。未認証アクセスをテストします...")
        # トークンなしでテスト
        try:
            response = requests.post(f"{API_BASE_URL}/api/auth/verify")
            print(f"ステータスコード: {response.status_code}")
            print(f"レスポンス: {response.text}")
        except Exception as e:
            print(f"エラー: {str(e)}")
        
        # 無効なトークンでテスト
        try:
            headers = {"Authorization": "Bearer invalid_token"}
            response = requests.post(f"{API_BASE_URL}/api/auth/verify", headers=headers)
            print(f"無効なトークンでのステータスコード: {response.status_code}")
            print(f"無効なトークンでのレスポンス: {response.text}")
        except Exception as e:
            print(f"無効なトークンでのエラー: {str(e)}")
    else:
        print(f"提供されたトークンでテストしています...")
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.post(f"{API_BASE_URL}/api/auth/verify", headers=headers)
            print(f"ステータスコード: {response.status_code}")
            print(f"レスポンス: {response.text}")
            
            if response.status_code == 200:
                # 検索エンドポイントをテスト
                search_data = {
                    "q": "python プログラミング",
                    "max_results": 5
                }
                response = requests.post(
                    f"{API_BASE_URL}/api/search", 
                    headers=headers,
                    json=search_data
                )
                print(f"\n検索エンドポイントのステータスコード: {response.status_code}")
                if response.status_code == 200:
                    print(f"検索結果: {len(response.json().get('videos', []))}件のビデオが見つかりました")
                else:
                    print(f"検索レスポンス: {response.text}")
        except Exception as e:
            print(f"エラー: {str(e)}")

if __name__ == "__main__":
    # コマンドライン引数としてトークンが提供されているかチェック
    token = sys.argv[1] if len(sys.argv) > 1 else None
    test_auth_verification(token)
