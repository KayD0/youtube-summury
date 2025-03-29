/**
 * Utility for testing Firebase authentication with the backend
 * 
 * This file provides a simple way to get the current user's ID token
 * and test the backend authentication verification.
 */

import { getIdToken, verifyAuth } from '../services/auth-api-service.js';
import { getCurrentUser, isAuthenticated } from '../services/firebase.js';

/**
 * Display the current authentication status and token
 */
export async function displayAuthStatus() {
    const authStatusDiv = document.createElement('div');
    authStatusDiv.className = 'auth-status card mb-4';
    
    const authenticated = isAuthenticated();
    const user = getCurrentUser();
    
    let content = `
        <div class="card-header bg-${authenticated ? 'success' : 'danger'} text-white">
            <h5 class="mb-0">Authentication Status</h5>
        </div>
        <div class="card-body">
            <p><strong>Authenticated:</strong> ${authenticated ? 'Yes' : 'No'}</p>
    `;
    
    if (authenticated && user) {
        const token = await getIdToken();
        const tokenPreview = token ? `${token.substring(0, 20)}...` : 'Unable to get token';
        
        content += `
            <p><strong>User:</strong> ${user.email}</p>
            <p><strong>UID:</strong> ${user.uid}</p>
            <p><strong>Token Preview:</strong> ${tokenPreview}</p>
            <div class="mb-3">
                <button id="copy-token-btn" class="btn btn-sm btn-outline-primary">Copy Full Token</button>
                <button id="verify-token-btn" class="btn btn-sm btn-outline-success">Verify Token with Backend</button>
            </div>
            <div id="verification-result" class="alert alert-info d-none">
                Verification result will appear here
            </div>
        `;
    } else {
        content += `
            <p>Please sign in to get an authentication token.</p>
            <a href="/login" class="btn btn-primary">Go to Login</a>
        `;
    }
    
    content += `</div>`;
    authStatusDiv.innerHTML = content;
    
    // Add to the DOM
    document.body.appendChild(authStatusDiv);
    
    // Add event listeners
    if (authenticated && user) {
        const copyTokenBtn = authStatusDiv.querySelector('#copy-token-btn');
        const verifyTokenBtn = authStatusDiv.querySelector('#verify-token-btn');
        const verificationResult = authStatusDiv.querySelector('#verification-result');
        
        copyTokenBtn.addEventListener('click', async () => {
            const token = await getIdToken();
            if (token) {
                navigator.clipboard.writeText(token)
                    .then(() => {
                        copyTokenBtn.textContent = 'Copied!';
                        setTimeout(() => {
                            copyTokenBtn.textContent = 'Copy Full Token';
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy token:', err);
                        copyTokenBtn.textContent = 'Copy Failed';
                        setTimeout(() => {
                            copyTokenBtn.textContent = 'Copy Full Token';
                        }, 2000);
                    });
            }
        });
        
        verifyTokenBtn.addEventListener('click', async () => {
            verifyTokenBtn.disabled = true;
            verifyTokenBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Verifying...';
            verificationResult.classList.remove('d-none');
            verificationResult.textContent = 'Verifying token with backend...';
            
            try {
                const result = await verifyAuth();
                verificationResult.className = 'alert alert-success';
                verificationResult.innerHTML = `
                    <strong>Verification Successful!</strong><br>
                    User ID: ${result.user.uid}<br>
                    Email: ${result.user.email}<br>
                    Email Verified: ${result.user.email_verified ? 'Yes' : 'No'}<br>
                    Auth Time: ${new Date(result.user.auth_time * 1000).toLocaleString()}
                `;
            } catch (error) {
                verificationResult.className = 'alert alert-danger';
                verificationResult.textContent = `Verification Failed: ${error.message}`;
            } finally {
                verifyTokenBtn.disabled = false;
                verifyTokenBtn.textContent = 'Verify Token with Backend';
            }
        });
    }
    
    return authStatusDiv;
}

/**
 * Initialize the auth test utility
 */
export function initAuthTest() {
    // Listen for auth state changes
    window.addEventListener('authStateChanged', async () => {
        // Remove any existing auth status display
        const existingStatus = document.querySelector('.auth-status');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        // Display new auth status
        await displayAuthStatus();
    });
    
    // Initial display
    displayAuthStatus();
}

// Auto-initialize if this script is loaded directly
if (window.location.pathname === '/auth-test') {
    document.addEventListener('DOMContentLoaded', () => {
        initAuthTest();
    });
}
