/**
 * Firebase認証をバックエンドでテストするためのユーティリティ
 * 
 * このファイルは、現在のユーザーのIDトークンを取得し、
 * バックエンドの認証検証をテストするための簡単な方法を提供します。
 */

import { getIdToken, verifyAuth } from '../services/auth-api-service.js';
import { getCurrentUser, isAuthenticated } from '../services/firebase.js';

/**
 * 現在の認証状態とトークンを表示
 * @param {HTMLElement} container - 認証状態を表示するコンテナ要素
 */
export async function displayAuthStatus(container = null) {
    const authStatusDiv = document.createElement('div');
    authStatusDiv.className = 'auth-status card mb-4';
    
    const authenticated = isAuthenticated();
    const user = getCurrentUser();
    
    let content = `
        <div class="card-header bg-${authenticated ? 'success' : 'danger'} text-white">
            <h5 class="mb-0">認証状態</h5>
        </div>
        <div class="card-body">
            <p><strong>認証済み:</strong> ${authenticated ? 'はい' : 'いいえ'}</p>
    `;
    
    if (authenticated && user) {
        const token = await getIdToken();
        const tokenPreview = token ? `${token.substring(0, 20)}...` : 'トークンを取得できません';
        
        content += `
            <p><strong>ユーザー:</strong> ${user.email}</p>
            <p><strong>UID:</strong> ${user.uid}</p>
            <p><strong>トークンプレビュー:</strong> ${tokenPreview}</p>
            <div class="mb-3">
                <button id="copy-token-btn" class="btn btn-sm btn-outline-primary">完全なトークンをコピー</button>
                <button id="verify-token-btn" class="btn btn-sm btn-outline-success">バックエンドでトークンを検証</button>
            </div>
            <div id="verification-result" class="alert alert-info d-none">
                検証結果がここに表示されます
            </div>
        `;
    } else {
        content += `
            <p>認証トークンを取得するにはサインインしてください。</p>
            <a href="/login" class="btn btn-primary">ログインへ</a>
        `;
    }
    
    content += `</div>`;
    authStatusDiv.innerHTML = content;
    
    // 指定されたコンテナに追加するか、コンテナがない場合はbodyに追加
    if (container) {
        container.innerHTML = ''; // コンテナの内容をクリア
        container.appendChild(authStatusDiv);
    } else {
        document.body.appendChild(authStatusDiv);
    }
    
    // イベントリスナーを追加
    if (authenticated && user) {
        const copyTokenBtn = authStatusDiv.querySelector('#copy-token-btn');
        const verifyTokenBtn = authStatusDiv.querySelector('#verify-token-btn');
        const verificationResult = authStatusDiv.querySelector('#verification-result');
        
        copyTokenBtn.addEventListener('click', async () => {
            const token = await getIdToken();
            if (token) {
                navigator.clipboard.writeText(token)
                    .then(() => {
                        copyTokenBtn.textContent = 'コピーしました！';
                        setTimeout(() => {
                            copyTokenBtn.textContent = '完全なトークンをコピー';
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('トークンのコピーに失敗:', err);
                        copyTokenBtn.textContent = 'コピー失敗';
                        setTimeout(() => {
                            copyTokenBtn.textContent = '完全なトークンをコピー';
                        }, 2000);
                    });
            }
        });
        
        verifyTokenBtn.addEventListener('click', async () => {
            verifyTokenBtn.disabled = true;
            verifyTokenBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 検証中...';
            verificationResult.classList.remove('d-none');
            verificationResult.textContent = 'バックエンドでトークンを検証中...';
            
            try {
                const result = await verifyAuth();
                verificationResult.className = 'alert alert-success';
                verificationResult.innerHTML = `
                    <strong>検証成功！</strong><br>
                    ユーザーID: ${result.user.uid}<br>
                    メール: ${result.user.email}<br>
                    メール確認済み: ${result.user.email_verified ? 'はい' : 'いいえ'}<br>
                    認証時間: ${new Date(result.user.auth_time * 1000).toLocaleString()}
                `;
            } catch (error) {
                verificationResult.className = 'alert alert-danger';
                verificationResult.textContent = `検証失敗: ${error.message}`;
            } finally {
                verifyTokenBtn.disabled = false;
                verifyTokenBtn.textContent = 'バックエンドでトークンを検証';
            }
        });
    }
    
    return authStatusDiv;
}

/**
 * 認証テストユーティリティを初期化
 * @deprecated 代わりにdisplayAuthStatus()を直接使用してください
 */
export function initAuthTest() {
    console.warn('initAuthTest()は非推奨です。代わりにdisplayAuthStatus()を直接使用してください。');
    
    // 認証状態の変更をリッスン
    window.addEventListener('authStateChanged', async () => {
        // 既存の認証状態表示を削除
        const existingStatus = document.querySelector('.auth-status');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        // 新しい認証状態を表示
        await displayAuthStatus();
    });
    
    // 初期表示
    displayAuthStatus();
}
