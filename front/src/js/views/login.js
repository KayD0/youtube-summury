import { signIn } from "../services/firebase.js";

export default () => {
  // This function will be called after the view is rendered
  setTimeout(() => {
    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("loginErrorMessage");
    
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Get form data
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        
        // Clear previous error messages
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
        
        // Show loading state
        const submitBtn = loginForm.querySelector("button[type='submit']");
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
        
        // Attempt to sign in
        const { user, error } = await signIn(email, password);
        
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        
        if (error) {
          // Show error message
          errorMessage.textContent = error;
          errorMessage.style.display = "block";
        } else {
          // Redirect to home page on successful login
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
            <h2 class="card-title mb-0">Login</h2>
          </div>
          <div class="card-body">
            <div class="alert alert-danger" id="loginErrorMessage" style="display: none;"></div>
            
            <form id="loginForm">
              <div class="mb-3">
                <label for="loginEmail" class="form-label">Email address</label>
                <input type="email" class="form-control" id="loginEmail" required>
              </div>
              <div class="mb-3">
                <label for="loginPassword" class="form-label">Password</label>
                <input type="password" class="form-control" id="loginPassword" required>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <button type="submit" class="btn btn-primary">Login</button>
                <a href="/register" data-link>Don't have an account? Register</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
};
