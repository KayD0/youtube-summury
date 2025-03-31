# システムアーキテクチャ

このドキュメントでは、YouTubeビデオ検索・要約アプリケーションのシステムアーキテクチャを説明します。

## システム全体構成

```mermaid
graph TB
    subgraph "フロントエンド (JavaScript)"
        A[index.html] --> B[main.js]
        B --> C[Views]
        B --> D[Components]
        B --> E[Services]
        
        subgraph "Views"
            C --> C1[home.js]
            C --> C2[auth-test.js]
            C --> C3[その他のビュー]
        end
        
        subgraph "Components"
            D --> D1[youtube-search.js]
            D --> D2[youtube-summary.js]
        end
        
        subgraph "Services"
            E --> E1[firebase.js]
            E --> E2[auth-api-service.js]
        end
        
        subgraph "Utils"
            F[auth-test.js]
        end
        
        C2 --> F
        E2 --> E1
    end
    
    subgraph "バックエンド (Flask)"
        G[app.py] --> H[Controllers]
        G --> I[Services]
        
        subgraph "Controllers"
            H --> H1[main_controller.py]
            H --> H2[auth_controller.py]
            H --> H3[youtube_controller.py]
        end
        
        subgraph "Services"
            I --> I1[auth_service.py]
            I --> I2[youtube_service.py]
            I --> I3[gemini_service.py]
        end
        
        H3 --> I2
        H3 --> I3
        H2 --> I1
    end
    
    E2 <--> H2
    D1 <--> H3
    D2 <--> H3
```

## 認証フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Frontend as フロントエンド
    participant Firebase as Firebase Auth
    participant Backend as バックエンドAPI
    
    User->>Frontend: ログイン
    Frontend->>Firebase: 認証リクエスト
    Firebase-->>Frontend: IDトークン発行
    Frontend->>Frontend: トークンを保存
    
    User->>Frontend: APIリクエスト
    Frontend->>Frontend: トークンを取得
    Frontend->>Backend: リクエスト + Authorizationヘッダー
    Backend->>Backend: auth_requiredデコレータ
    Backend->>Firebase: トークン検証
    Firebase-->>Backend: 検証結果
    
    alt トークン有効
        Backend-->>Frontend: APIレスポンス
        Frontend-->>User: 結果表示
    else トークン無効
        Backend-->>Frontend: 401 Unauthorized
        Frontend-->>User: エラー表示
    end
```

## バックエンドコントローラー構造

```mermaid
classDiagram
    class Flask {
        +register_blueprint()
    }
    
    class Blueprint {
        +route()
    }
    
    class MainController {
        +main_bp: Blueprint
        +index()
    }
    
    class AuthController {
        +auth_bp: Blueprint
        +verify_auth()
    }
    
    class YouTubeController {
        +youtube_bp: Blueprint
        +youtube_service
        +gemini_service
        +search_videos()
        +summarize_video()
    }
    
    Flask --> MainController: register
    Flask --> AuthController: register
    Flask --> YouTubeController: register
    
    MainController --> Blueprint: uses
    AuthController --> Blueprint: uses
    YouTubeController --> Blueprint: uses
```

## YouTube検索・要約フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Frontend as フロントエンド
    participant Backend as バックエンドAPI
    participant YouTube as YouTube API
    participant Gemini as Vertex AI Gemini
    
    User->>Frontend: 検索キーワード入力
    Frontend->>Backend: 検索リクエスト + トークン
    Backend->>Backend: トークン検証
    Backend->>YouTube: 検索リクエスト
    YouTube-->>Backend: 検索結果
    Backend-->>Frontend: 検索結果
    Frontend-->>User: 検索結果表示
    
    User->>Frontend: 要約リクエスト
    Frontend->>Backend: 要約リクエスト + トークン
    Backend->>Backend: トークン検証
    Backend->>YouTube: ビデオ詳細取得
    YouTube-->>Backend: ビデオ詳細
    Backend->>Gemini: 要約生成リクエスト
    Gemini-->>Backend: 要約結果
    Backend-->>Frontend: 要約結果
    Frontend-->>User: 要約表示
```

## ディレクトリ構造

```mermaid
graph TD
    A[プロジェクトルート] --> B[backend]
    A --> C[front]
    A --> D[docs]
    
    B --> B1[controllers]
    B --> B2[services]
    B --> B3[app.py]
    B --> B4[その他のファイル]
    
    B1 --> B1a[__init__.py]
    B1 --> B1b[main_controller.py]
    B1 --> B1c[auth_controller.py]
    B1 --> B1d[youtube_controller.py]
    
    B2 --> B2a[__init__.py]
    B2 --> B2b[auth_service.py]
    B2 --> B2c[youtube_service.py]
    B2 --> B2d[gemini_service.py]
    
    C --> C1[src]
    C --> C2[public]
    C --> C3[その他のファイル]
    
    C1 --> C1a[js]
    C1 --> C1b[css]
    
    C1a --> C1a1[components]
    C1a --> C1a2[services]
    C1a --> C1a3[utils]
    C1a --> C1a4[views]
    C1a --> C1a5[main.js]
    
    D --> D1[system_architecture.md]
```

## 技術スタック

- **フロントエンド**:
  - HTML/CSS/JavaScript
  - Bootstrap (スタイリング)
  - Vite (ビルドツール)
  - Firebase Authentication (認証)

- **バックエンド**:
  - Python
  - Flask (Webフレームワーク)
  - Blueprint (モジュール化)
  - Firebase Admin SDK (認証検証)
  - YouTube Data API (ビデオ検索)
  - Vertex AI Gemini (AI要約生成)
