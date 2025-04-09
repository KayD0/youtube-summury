from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

# サービスのインポート
from services.auth_service import initialize_firebase
from services.db_service import init_db, db

# コントローラー（Blueprint）のインポート
from controllers.main_controller import main_bp
from controllers.auth_controller import auth_bp
from controllers.youtube_controller import youtube_bp
from controllers.subscription_controller import subscription_bp

# 環境変数の読み込み
load_dotenv()

app = Flask(__name__)

# CORSの設定
CORS_ORIGIN = os.getenv('CORS_ORIGIN', 'http://localhost:3000')
CORS(app, resources={r"/api/*": {"origins": CORS_ORIGIN}})

# Firebase Admin SDKの初期化
firebase_initialized = initialize_firebase()
if not firebase_initialized:
    print("警告: Firebase Admin SDKの初期化に失敗しました")

# データベースの初期化
init_db(app)

# Blueprintの登録
app.register_blueprint(main_bp)
app.register_blueprint(youtube_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(subscription_bp)

# データベーステーブルの作成
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    # Flaskアプリを実行
    app.run(debug=True)
