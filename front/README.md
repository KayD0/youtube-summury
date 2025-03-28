# Vanilla SPA with Bootstrap and Firebase

シンプルなバニラJavaScriptのSPA（Single Page Application）にBootstrapとFirebase認証を組み込んだプロジェクトです。

## 機能

- Bootstrap 5によるレスポンシブデザイン
- Firebase認証（ログイン、登録、プロフィール管理）
- シンプルなルーティングシステム
- 環境変数を使用したセキュアな設定管理
- Viteによる高速な開発環境

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成します
2. Authentication機能を有効にし、Email/Passwordプロバイダーを有効にします
3. プロジェクト設定からWebアプリを追加し、Firebase設定情報を取得します
4. `.env`ファイルを作成し、以下の環境変数を設定します：

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

### 4. ビルド

```bash
npm run build
```

## トラブルシューティング

### Firebase認証エラー（auth/configuration-not-found）

このエラーが発生する一般的な原因と解決策：

1. **環境変数が正しく設定されていない**
   - `.env`ファイルが正しい場所（プロジェクトのルートディレクトリ）にあることを確認
   - 環境変数名が`VITE_`で始まっていることを確認
   - 値が正しく設定されていることを確認（引用符なし）

2. **Firebase Authenticationが有効になっていない**
   - Firebase Consoleで認証機能が有効になっていることを確認
   - Email/Passwordプロバイダーが有効になっていることを確認

3. **ブラウザのキャッシュ/Cookieの問題**
   - ブラウザのキャッシュとCookieをクリア
   - シークレットモードで試す

4. **Firebase設定の問題**
   - Firebase Consoleで正しいプロジェクトを選択していることを確認
   - Webアプリが正しく登録されていることを確認

5. **開発サーバーの再起動**
   - 環境変数を変更した後は、開発サーバーを再起動する

### コンソールでのデバッグ

ブラウザのコンソールで以下の情報を確認することで、問題を特定できます：

- 環境変数が正しく読み込まれているか
- Firebase初期化エラーメッセージ
- 認証関連のエラーメッセージ

## プロジェクト構造

```
/
├── .env                  # 環境変数（gitignoreされる）
├── .env.example          # 環境変数のサンプル
├── index.html            # エントリーポイント
├── vite.config.js        # Vite設定
├── src/
│   ├── css/
│   │   ├── main.scss     # メインSCSSファイル（Bootstrapをインポート）
│   │   └── style.css     # カスタムスタイル
│   ├── js/
│   │   ├── bootstrap.js  # Bootstrap JS初期化
│   │   ├── main.js       # メインJSファイル
│   │   ├── components/   # Webコンポーネント
│   │   ├── services/     # サービス（Firebase等）
│   │   └── views/        # ビュー（ページコンテンツ）
```

## 技術スタック

- Vanilla JavaScript
- Bootstrap 5
- Firebase Authentication
- Vite
- SCSS
