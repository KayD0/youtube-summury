import { initAuthTest } from "../utils/auth-test.js";

export default () => {
    // ビューがレンダリングされた後に認証テストユーティリティを初期化
    setTimeout(() => {
        initAuthTest();
    }, 0);
    
    return /*html*/`
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h1 class="card-title">認証テスト</h1>
                        <p class="card-text">
                            このページでは、Firebaseの認証をバックエンドでテストすることができます。
                            認証状態の確認、IDトークンの取得、バックエンドでの検証が可能です。
                        </p>
                        <p class="card-text">
                            <strong>使用方法:</strong>
                        </p>
                        <ol>
                            <li>まだ認証されていない場合は、ログインページからサインインしてください</li>
                            <li>下記で認証状態とトークンを確認できます</li>
                            <li>「完全なトークンをコピー」をクリックしてIDトークンをクリップボードにコピーします</li>
                            <li>「バックエンドでトークンを検証」をクリックしてバックエンドでトークン検証をテストします</li>
                        </ol>
                        <p class="card-text">
                            <strong>バックエンドテスト用:</strong>
                        </p>
                        <ol>
                            <li>下のボタンを使用してトークンをコピーします</li>
                            <li>バックエンドテストスクリプトをトークン付きで実行します:
                                <code>python test_auth.py あなたのトークン</code>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 認証状態はauth-test.jsユーティリティによってここに表示されます -->
    `;
};
