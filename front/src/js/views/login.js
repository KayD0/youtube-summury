import { signIn } from "../services/firebase.js";

export default () => {
  // ビューがレンダリングされた後に呼び出される関数
  setTimeout(() => {
    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("loginErrorMessage");
    
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // フォームデータを取得
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        
        // 以前のエラーメッセージをクリア
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
        
        // ローディング状態を表示
        const submitBtn = loginForm.querySelector("button[type='submit']");
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 処理中...';
        
        // サインインを試みる
        const { user, error } = await signIn(email, password);
        
        // ボタンの状態をリセット
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        
        if (error) {
          // エラーメッセージを表示
          errorMessage.textContent = error;
          errorMessage.style.display = "block";
        } else {
          // ログイン成功時にホームページにリダイレクト
          history.pushState("", "", "/");
          window.dispatchEvent(new Event("popstate"));
        }
      });
    }
  }, 0);
  
  return /*html*/`
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title mb-0">ログイン</h2>
          </div>
          <div class="card-body">
            <div class="alert alert-danger" id="loginErrorMessage" style="display: none;"></div>
            
            <form id="loginForm">
              <div class="mb-3">
                <label for="loginEmail" class="form-label">メールアドレス</label>
                <input type="email" class="form-control" id="loginEmail" required>
              </div>
              <div class="mb-3">
                <label for="loginPassword" class="form-label">パスワード</label>
                <input type="password" class="form-control" id="loginPassword" required>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <button type="submit" class="btn btn-primary">ログイン</button>
                <a href="/register" data-link>アカウントをお持ちでない方は登録</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
};
