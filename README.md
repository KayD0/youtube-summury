# YouTube検索・要約アプリケーション

Firebase認証を使用し、YouTubeビデオを検索して、Vertex AI Geminiによる要約を生成するWebアプリケーション。

![システム構成図](docs/system_architecture_preview.png)

## 目次

- [概要](#概要)
- [機能](#機能)
- [技術スタック](#技術スタック)
- [システムアーキテクチャ](#システムアーキテクチャ)
- [セットアップ手順](#セットアップ手順)
  - [前提条件](#前提条件)
  - [APIキーの取得](#apiキーの取得)
  - [バックエンドのセットアップ](#バックエンドのセットアップ)
  - [フロントエンドのセットアップ](#フロントエンドのセットアップ)
- [開発環境](#開発環境)
- [使用方法](#使用方法)
- [ディレクトリ構造](#ディレクトリ構造)
- [ライセンス](#ライセンス)

## 概要

このアプリケーションは、ユーザーがFirebase認証でログインし、YouTubeビデオを検索して、選択したビデオの内容をVertex AI Geminiを使用して要約する機能を提供します。バックエンドはFlaskで実装され、フロントエンドはVanilla JSとBootstrapで構築されています。

## 機能

- **ユーザー認証**: Firebase Authenticationを使用したユーザー登録・ログイン
- **YouTube検索**: キーワードに基づいてYouTubeビデオを検索
- **ビデオ要約**: Vertex AI Geminiを使用してビデオ内容の要約を生成
- **認証トークン検証**: バックエンドでのFirebase IDトークン検証
- **レスポンシブUI**: モバイルデバイスにも対応したユーザーインターフェース

## 技術スタック

### フロントエンド

- **HTML/CSS/JavaScript**: 基本的なWeb技術
- **Bootstrap 5**: UIコンポーネントとレスポンシブデザイン
- **Vite**: モジュールバンドラー・開発サーバー
- **Firebase SDK**: 認証とIDトークン管理

### バックエンド

- **Python**: サーバーサイド言語
- **Flask**: Webフレームワーク
- **Blueprint**: モジュール化されたルーティング
- **Firebase Admin SDK**: IDトークン検証
- **YouTube Data API**: ビデオ検索と情報取得
- **Vertex AI Gemini**: AI要約生成

### クラウドサービス

- **Firebase Authentication**: ユーザー認証
- **Google Cloud Platform**: 
  - **YouTube Data API**: ビデオ検索
  - **Vertex AI**: Geminiモデルによる要約生成

## システムアーキテクチャ

詳細なシステムアーキテクチャは[docs/system_architecture.md](docs/system_architecture.md)を参照してください。

## セットアップ手順

### 前提条件

- Python 3.7以上
- Node.js 14以上
- npm または yarn
- Google Cloudアカウント
- Firebaseプロジェクト

### APIキーの取得

#### YouTube Data API

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを作成または選択
3. YouTube Data API v3を有効化
4. 認証情報ページでAPIキーを作成
5. 必要に応じてAPIキーの制限を設定

#### Firebase設定

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを作成または選択
3. Authentication機能を有効化し、メール/パスワード認証を設定
4. プロジェクト設定からWebアプリを追加
5. 提供されるFirebase設定オブジェクトをコピー
6. プロジェクト設定 > サービスアカウントから新しい秘密鍵を生成

#### Vertex AI設定

1. [Google Cloud Console](https://console.cloud.google.com/)で同じプロジェクトを選択
2. Vertex AI APIを有効化
3. サービスアカウントを作成し、適切な権限を付与
4. サービスアカウントキーをJSON形式でダウンロード

### バックエンドのセットアップ

1. リポジトリをクローン:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. バックエンドディレクトリに移動:
   ```bash
   cd backend
   ```

3. 仮想環境を作成して有効化:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

4. 依存関係をインストール:
   ```bash
   pip install -r requirements.txt
   ```

5. `.env.example`をコピーして`.env`ファイルを作成:
   ```bash
   cp .env.example .env
   ```

6. `.env`ファイルを編集し、必要な環境変数を設定:
   ```
   # YouTube API認証情報
   YOUTUBE_API_KEY=あなたのyoutube_api_keyをここに

   # CORS設定
   CORS_ORIGIN=http://localhost:3000

   # Google Cloud設定
   GOOGLE_CLOUD_PROJECT=あなたのgoogle_cloudプロジェクトID
   GOOGLE_CLOUD_LOCATION=us-central1
   GEMINI_MODEL_ID=gemini-1.5-pro

   # Google Cloud認証情報ファイルを指すように環境変数を設定
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/credentials.json

   # Firebase設定
   FIREBASE_PROJECT_ID=あなたのfirebaseプロジェクトID
   FIREBASE_PRIVATE_KEY_ID=あなたのprivate_key_id
   FIREBASE_PRIVATE_KEY=あなたのprivate_key
   FIREBASE_CLIENT_EMAIL=あなたのclient_email
   FIREBASE_CLIENT_ID=あなたのclient_id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_X509_CERT_URL=あなたのclient_x509_cert_url
   ```

7. バックエンドサーバーを起動:
   ```bash
   python app.py
   ```
   サーバーは`http://localhost:5000`で実行されます。

### フロントエンドのセットアップ

1. フロントエンドディレクトリに移動:
   ```bash
   cd front
   ```

2. 依存関係をインストール:
   ```bash
   npm install
   # または
   yarn
   ```

3. `.env.example`をコピーして`.env`ファイルを作成:
   ```bash
   cp .env.example .env
   ```

4. `.env`ファイルを編集し、Firebase設定を追加:
   ```
   VITE_FIREBASE_API_KEY=あなたのapiKey
   VITE_FIREBASE_AUTH_DOMAIN=あなたのauthDomain
   VITE_FIREBASE_PROJECT_ID=あなたのprojectId
   VITE_FIREBASE_STORAGE_BUCKET=あなたのstorageBucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=あなたのmessagingSenderId
   VITE_FIREBASE_APP_ID=あなたのappId
   
   VITE_API_BASE_URL=http://localhost:5000
   ```

5. 開発サーバーを起動:
   ```bash
   npm run dev
   # または
   yarn dev
   ```
   フロントエンドは`http://localhost:3000`で実行されます。

## 開発環境

### バックエンド開発

- コントローラーの追加:
  1. `backend/controllers/`に新しいコントローラーファイルを作成
  2. Blueprintを定義し、ルートを設定
  3. 必要なサービスをコントローラー内で初期化
  4. `app.py`でBlueprintを登録

- サービスの追加:
  1. `backend/services/`に新しいサービスファイルを作成
  2. 必要なクラスとメソッドを実装
  3. コントローラーからサービスをインポートして使用

### フロントエンド開発

- コンポーネントの追加:
  1. `front/src/js/components/`に新しいコンポーネントファイルを作成
  2. 必要なHTMLとJavaScriptを実装
  3. メインアプリケーションからコンポーネントをインポートして使用

- ビューの追加:
  1. `front/src/js/views/`に新しいビューファイルを作成
  2. ルーターに新しいルートを追加

## 使用方法

1. アプリケーションにアクセス: `http://localhost:3000`
2. ログインまたは新規ユーザー登録
3. ホームページでYouTubeビデオを検索
4. 検索結果から興味のあるビデオを選択
5. 「要約を生成」ボタンをクリックして要約を取得
6. 認証テストページで認証状態とトークンを確認可能

## ディレクトリ構造

```
プロジェクトルート/
├── backend/                  # バックエンドアプリケーション
│   ├── controllers/          # Blueprintコントローラー
│   │   ├── __init__.py
│   │   ├── auth_controller.py
│   │   ├── main_controller.py
│   │   └── youtube_controller.py
│   ├── services/             # サービスクラス
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── gemini_service.py
│   │   └── youtube_service.py
│   ├── app.py                # メインFlaskアプリケーション
│   ├── requirements.txt      # Pythonの依存関係
│   └── .env.example          # 環境変数のサンプル
│
├── front/                    # フロントエンドアプリケーション
│   ├── src/
│   │   ├── css/              # スタイルシート
│   │   ├── js/               # JavaScriptファイル
│   │   │   ├── components/   # 再利用可能なコンポーネント
│   │   │   ├── services/     # APIサービス
│   │   │   ├── utils/        # ユーティリティ関数
│   │   │   ├── views/        # ページビュー
│   │   │   └── main.js       # メインエントリーポイント
│   ├── index.html            # メインHTMLファイル
│   ├── package.json          # npm依存関係
│   └── .env.example          # 環境変数のサンプル
│
├── docs/                     # ドキュメント
│   └── system_architecture.md # システムアーキテクチャ図
│
└── README.md                 # このファイル
```

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。
