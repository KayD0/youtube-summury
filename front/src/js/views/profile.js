import { getCurrentUser, signOut } from "../services/firebase.js";

export default () => {
  // This function will be called after the view is rendered
  setTimeout(() => {
    const logoutBtn = document.getElementById("logoutBtn");
    
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        // Show loading state
        const originalBtnText = logoutBtn.textContent;
        logoutBtn.disabled = true;
        logoutBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
        
        // Attempt to sign out
        const { error } = await signOut();
        
        // Reset button state
        logoutBtn.disabled = false;
        logoutBtn.textContent = originalBtnText;
        
        if (!error) {
          // Redirect to login page on successful logout
          history.pushState("", "", "/login");
          window.dispatchEvent(new Event("popstate"));
        }
      });
    }
  }, 0);
  
  const user = getCurrentUser();
  
  if (!user) {
    // Redirect to login if not authenticated
    setTimeout(() => {
      history.pushState("", "", "/login");
      window.dispatchEvent(new Event("popstate"));
    }, 0);
    
    return /*html*/`
      <div class="alert alert-warning">
        You need to be logged in to view this page. Redirecting to login...
      </div>
    `;
  }
  
  return /*html*/`
    <div class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title mb-0">User Profile</h2>
          </div>
          <div class="card-body">
            <div class="mb-4">
              <h4>Account Information</h4>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>User ID:</strong> ${user.uid}</p>
              <p><strong>Email Verified:</strong> ${user.emailVerified ? 'Yes' : 'No'}</p>
            </div>
            
            <button id="logoutBtn" class="btn btn-danger">Logout</button>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="card bg-light">
          <div class="card-header">
            <h5 class="card-title mb-0">Account Settings</h5>
          </div>
          <div class="list-group list-group-flush">
            <a href="#" class="list-group-item list-group-item-action">Change Password</a>
            <a href="#" class="list-group-item list-group-item-action">Update Profile</a>
            <a href="#" class="list-group-item list-group-item-action">Privacy Settings</a>
          </div>
        </div>
      </div>
    </div>
  `;
};
