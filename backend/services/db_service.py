from flask_sqlalchemy import SQLAlchemy
import os

# SQLAlchemyインスタンスを作成
db = SQLAlchemy()

def init_db(app):
    """
    Flaskアプリケーションにデータベース設定を適用し、SQLAlchemyを初期化します。
    
    Args:
        app: Flaskアプリケーションインスタンス
    """
    # 環境変数からデータベース接続情報を取得
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'youtubeapp')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', 'postgres')
    
    # SQLAlchemy設定
    # psycopg3を使用するように接続文字列を更新
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql+psycopg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # SQLAlchemyをアプリケーションに初期化
    db.init_app(app)
