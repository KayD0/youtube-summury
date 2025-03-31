# YouTube検索と要約API

キーワードを使用してYouTubeビデオを検索し、GoogleのVertex AI Geminiモデルを使用してAI駆動の要約を生成するFlask APIです。

## セットアップ

### 前提条件

- Python 3.7以上
- YouTube Data API v3が有効なGoogle APIキー
- Vertex AI APIが有効なGoogle Cloudプロジェクト（ビデオ要約用）
- Firebase Admin SDK（認証用）

### インストール

1. リポジトリをクローンします
2. backendディレクトリに移動します
3. 必要な依存関係をインストールします：

```bash
pip install -r requirements.txt
```

4. `.env.example`ファイルを基に`.env`ファイルを作成します：

```bash
cp .env.example .env
```

5. `.env`ファイルを編集し、APIキーと設定を追加します：

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

### APIキーの取得

#### YouTube APIキー

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセスします
2. 新しいプロジェクトを作成するか、既存のプロジェクトを選択します
3. YouTube Data API v3を有効にします
4. 認証情報（APIキー）を作成します
5. APIキーを`.env`ファイルにコピーします

#### Google CloudとVertex AIのセットアップ

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセスします
2. 新しいプロジェクトを作成するか、既存のプロジェクトを選択します
3. Vertex AI APIを有効にします
4. 適切な権限を持つサービスアカウントを作成します
5. サービスアカウントキーJSONファイルをダウンロードします
6. `GOOGLE_APPLICATION_CREDENTIALS`環境変数をこのファイルを指すように設定します
7. Google CloudプロジェクトIDで`.env`ファイルを更新します

#### Firebase認証のセットアップ

1. [Firebase Console](https://console.firebase.google.com/)にアクセスします
2. 新しいプロジェクトを作成するか、既存のプロジェクトを選択します
3. プロジェクト設定 > サービスアカウントに移動します
4. 「新しい秘密鍵を生成」をクリックしてJSONファイルをダウンロードします
5. JSONファイルの内容を`.env`ファイルの対応する変数に設定します

## APIの実行

Flask開発サーバーを起動します：

```bash
python app.py
```

APIは`http://localhost:5000`で利用可能になります。

## APIエンドポイント

### GET /

APIが実行中であることを確認するための簡単なメッセージを返します。

### POST /api/auth/verify

認証トークンを検証し、ユーザー情報を返します。

#### リクエストヘッダー

```
Authorization: Bearer <firebase_id_token>
```

#### レスポンス例

```json
{
  "user": {
    "uid": "user_id",
    "email": "user@example.com",
    "email_verified": true,
    "auth_time": 1648123456
  }
}
```

### POST /api/search

キーワードに基づいてYouTubeビデオを検索します。

#### リクエストボディ（JSON）

```json
{
  "q": "python チュートリアル",
  "max_results": 5,
  "channel_id": "UC_x5XG1OV2P6uZZ5FSM9Ttw",
  "published_after": "2023-01-01T00:00:00Z"
}
```

- `q`: 検索クエリ（必須）
- `max_results`: 返す結果の最大数（オプション、デフォルト：10）
- `channel_id`: チャンネルIDでフィルタリング（オプション）
- `published_after`: この日付以降に公開されたビデオでフィルタリング（オプション、ISO 8601形式）

#### リクエスト例

```
POST /api/search
Content-Type: application/json
Authorization: Bearer <firebase_id_token>

{
  "q": "python チュートリアル",
  "max_results": 5
}
```

#### レスポンス例

```json
{
  "query": "python チュートリアル",
  "count": 5,
  "videos": [
    {
      "id": "video_id",
      "title": "Python初心者向けチュートリアル",
      "description": "この包括的なチュートリアルでPythonプログラミングを学びましょう...",
      "thumbnail": "https://i.ytimg.com/vi/video_id/mqdefault.jpg",
      "channel_title": "プログラミングチャンネル",
      "published_at": "2023-01-01T00:00:00Z",
      "view_count": "1.2M",
      "like_count": "45K",
      "comment_count": "1.5K",
      "url": "https://www.youtube.com/watch?v=video_id"
    },
    // その他のビデオ...
  ]
}
```

### POST /api/summarize

Vertex AI Geminiを使用してYouTubeビデオの要約を生成します。

#### リクエストボディ（JSON）

```json
{
  "video_id": "dQw4w9WgXcQ"
}
```

- `video_id`: YouTubeビデオID（必須）

#### レスポンス例

```json
{
  "brief_summary": "このビデオは初心者向けのPythonプログラミングの包括的なチュートリアルで、基本的な構文、データ型、制御構造をカバーしています。",
  "key_points": [
    "Pythonは高水準のインタープリタ型プログラミング言語です",
    "変数は明示的な型宣言が不要です",
    "Pythonは中括弧の代わりにインデントを使用してコードブロックを表します",
    "この言語にはライブラリとフレームワークの豊富なエコシステムがあります"
  ],
  "main_topics": [
    "Python基礎",
    "データ型",
    "制御フロー",
    "関数"
  ],
  "video_id": "dQw4w9WgXcQ",
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

## エラーハンドリング

APIは適切なエラーメッセージとステータスコードを返します：

- 400 Bad Request: 必須パラメータの欠落
- 401 Unauthorized: 認証エラー
- 403 Forbidden: 権限エラー
- 500 Internal Server Error: YouTube APIエラー、Vertex AIエラー、またはサーバーエラー

## フロントエンド連携

このAPIは付属のフロントエンドアプリケーションと連携するように設計されています。フロントエンドには以下が含まれます：

1. カードレイアウトで結果を表示するYouTubeビデオ検索コンポーネント
2. Vertex AI Geminiを使用して要約を生成するビデオ要約コンポーネント
3. Firebase認証を使用したユーザー認証システム

フロントエンドを実行するには：

1. frontディレクトリに移動します
2. 依存関係をインストールします：`npm install`
3. 開発サーバーを起動します：`npm run dev`
4. `http://localhost:3000`でアプリケーションにアクセスします
