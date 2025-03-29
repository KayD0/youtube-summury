import { initAuthTest } from "../utils/auth-test.js";

export default () => {
    // Initialize the auth test utility after the view is rendered
    setTimeout(() => {
        initAuthTest();
    }, 0);
    
    return /*html*/`
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h1 class="card-title">Authentication Test</h1>
                        <p class="card-text">
                            This page allows you to test Firebase authentication with the backend.
                            You can view your authentication status, get your ID token, and verify it with the backend.
                        </p>
                        <p class="card-text">
                            <strong>How to use:</strong>
                        </p>
                        <ol>
                            <li>Sign in using the login page if you're not already authenticated</li>
                            <li>View your authentication status and token below</li>
                            <li>Click "Copy Full Token" to copy your ID token to the clipboard</li>
                            <li>Click "Verify Token with Backend" to test the token verification with the backend</li>
                        </ol>
                        <p class="card-text">
                            <strong>For backend testing:</strong>
                        </p>
                        <ol>
                            <li>Copy your token using the button below</li>
                            <li>Run the backend test script with your token:
                                <code>python test_auth.py YOUR_TOKEN_HERE</code>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Auth status will be displayed here by the auth-test.js utility -->
    `;
};
