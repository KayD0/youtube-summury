import { signUp } from "../services/firebase.js";

export default () => {
  // This function will be called after the view is rendered
  setTimeout(() => {
    const registerForm = document.getElementById("registerForm");
    const errorMessage = document.getElementById("registerErrorMessage");
    
    if (registerForm) {
      registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Get form data
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        
        // Clear previous error messages
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
        
        // Validate passwords match
        if (password !== confirmPassword) {
          errorMessage.textContent = "Passwords do not match";
          errorMessage.style.display = "block";
          return;
        }
        
        // Show loading state
        const submitBtn = registerForm.querySelector("button[type='submit']");
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
        
        // Attempt to sign up
        const { user, error } = await signUp(email, password);
        
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        
        if (error) {
          // Show error message
          errorMessage.textContent = error;
          errorMessage.style.display = "block";
        } else {
          // Redirect to home page on successful registration
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
            <h2 class="card-title mb-0">Register</h2>
          </div>
          <div class="card-body">
            <div class="alert alert-danger" id="registerErrorMessage" style="display: none;"></div>
            
            <form id="registerForm">
              <div class="mb-3">
                <label for="registerEmail" class="form-label">Email address</label>
                <input type="email" class="form-control" id="registerEmail" required>
                <div class="form-text">We'll never share your email with anyone else.</div>
              </div>
              <div class="mb-3">
                <label for="registerPassword" class="form-label">Password</label>
                <input type="password" class="form-control" id="registerPassword" required minlength="6">
                <div class="form-text">Password must be at least 6 characters long.</div>
              </div>
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm Password</label>
                <input type="password" class="form-control" id="confirmPassword" required minlength="6">
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <button type="submit" class="btn btn-primary">Register</button>
                <a href="/login" data-link>Already have an account? Login</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
};
