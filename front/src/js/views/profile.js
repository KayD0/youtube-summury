import { getCurrentUser, signOut } from "../services/firebase.js";

export default () => {
  // ビューがレンダリングされた後に呼び出される関数
  setTimeout(() => {
    const logoutBtn = document.getElementById("logoutBtn");
    
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        // ローディング状態を表示
        const originalBtnText = logoutBtn.textContent;
        logoutBtn.disabled = true;
        logoutBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 処理中...';
        
        // サインアウトを試みる
        const { error } = await signOut();
        
        // ボタンの状態をリセット
        logoutBtn.disabled = false;
        logoutBtn.textContent = originalBtnText;
        
        if (!error) {
          // サインアウト成功時にログインページにリダイレクト
          history.pushState("", "", "/login");
          window.dispatchEvent(new Event("popstate"));
        }
      });
    }
  }, 0);
  
  const user = getCurrentUser();
  
  if (!user) {
    // 認証されていない場合はログインにリダイレクト
    setTimeout(() => {
      history.pushState("", "", "/login");
      window.dispatchEvent(new Event("popstate"));
    }, 0);
    
    return /*html*/`
      <div class="alert alert-warning">
        このページを表示するにはログインが必要です。ログインページにリダイレクトしています...
      </div>
    `;
  }
  
  return /*html*/`
    <div class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title mb-0">ユーザープロフィール</h2>
          </div>
          <div class="card-body">
            <div class="mb-4">
              <h4>アカウント情報</h4>
              <p><strong>メールアドレス:</strong> ${user.email}</p>
              <p><strong>ユーザーID:</strong> ${user.uid}</p>
              <p><strong>メール確認済み:</strong> ${user.emailVerified ? 'はい' : 'いいえ'}</p>
            </div>
            
            <button id="logoutBtn" class="btn btn-danger">ログアウト</button>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="card bg-light">
          <div class="card-header">
            <h5 class="card-title mb-0">アカウント設定</h5>
          </div>
          <div class="list-group list-group-flush">
            <a href="#" class="list-group-item list-group-item-action">パスワード変更</a>
            <a href="#" class="list-group-item list-group-item-action">プロフィール更新</a>
            <a href="#" class="list-group-item list-group-item-action">プライバシー設定</a>
          </div>
        </div>
      </div>
    </div>
  `;
};
