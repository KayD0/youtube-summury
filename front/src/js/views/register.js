import { signUp } from "../services/firebase.js";

export default () => {
  // ビューがレンダリングされた後に呼び出される関数
  setTimeout(() => {
    const registerForm = document.getElementById("registerForm");
    const errorMessage = document.getElementById("registerErrorMessage");
    
    if (registerForm) {
      registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // フォームデータを取得
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        
        // 以前のエラーメッセージをクリア
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
        
        // パスワードが一致するか検証
        if (password !== confirmPassword) {
          errorMessage.textContent = "パスワードが一致しません";
          errorMessage.style.display = "block";
          return;
        }
        
        // ローディング状態を表示
        const submitBtn = registerForm.querySelector("button[type='submit']");
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 処理中...';
        
        // サインアップを試みる
        const { user, error } = await signUp(email, password);
        
        // ボタンの状態をリセット
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        
        if (error) {
          // エラーメッセージを表示
          errorMessage.textContent = error;
          errorMessage.style.display = "block";
        } else {
          // 登録成功時にホームページにリダイレクト
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
            <h2 class="card-title mb-0">アカウント登録</h2>
          </div>
          <div class="card-body">
            <div class="alert alert-danger" id="registerErrorMessage" style="display: none;"></div>
            
            <form id="registerForm">
              <div class="mb-3">
                <label for="registerEmail" class="form-label">メールアドレス</label>
                <input type="email" class="form-control" id="registerEmail" required>
                <div class="form-text">あなたのメールアドレスを他者と共有することはありません。</div>
              </div>
              <div class="mb-3">
                <label for="registerPassword" class="form-label">パスワード</label>
                <input type="password" class="form-control" id="registerPassword" required minlength="6">
                <div class="form-text">パスワードは6文字以上である必要があります。</div>
              </div>
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">パスワード（確認）</label>
                <input type="password" class="form-control" id="confirmPassword" required minlength="6">
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <button type="submit" class="btn btn-primary">登録</button>
                <a href="/login" data-link>既にアカウントをお持ちの方はログイン</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
};
