/**
 * Authentication API Service
 * 
 * This service handles authentication token management for API requests.
 * It works with Firebase Authentication to get ID tokens and includes them
 * in API requests.
 */

import { getAuth } from 'firebase/auth';
import { getCurrentUser } from './firebase';

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Get the current user's ID token
 * 
 * @returns {Promise<string|null>} The ID token or null if not authenticated
 */
export async function getIdToken() {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    console.warn('No user is currently signed in');
    return null;
  }
  
  try {
    // Get a fresh token (force refresh = false by default)
    const token = await currentUser.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
}

/**
 * Make an authenticated API request
 * 
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export async function authenticatedFetch(endpoint, options = {}) {
  // Get the ID token
  const token = await getIdToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  // Add the token to the Authorization header
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };
  
  // Make the request with the token
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });
}

/**
 * Verify the authentication token with the backend
 * 
 * @returns {Promise<Object>} - User information from the verified token
 */
export async function verifyAuth() {
  try {
    const response = await authenticatedFetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Auth verification error:', error);
    throw error;
  }
}

/**
 * Search for YouTube videos (authenticated version)
 * 
 * @param {Object} params - Search parameters
 * @param {string} params.q - Search query
 * @param {string} params.published_after - Filter videos published after this date (ISO 8601 format)
 * @param {number} params.max_results - Maximum number of results to return
 * @param {string} params.channel_id - Filter by channel ID (optional)
 * @returns {Promise<Object>} - Search results
 */
export async function searchVideos(params) {
  try {
    const response = await authenticatedFetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
}

/**
 * Generate a summary for a YouTube video (authenticated version)
 * 
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Summary data
 */
export async function generateVideoSummary(videoId) {
  try {
    const response = await authenticatedFetch('/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ video_id: videoId })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating video summary:', error);
    throw error;
  }
}

export default {
  getIdToken,
  authenticatedFetch,
  verifyAuth,
  searchVideos,
  generateVideoSummary
};
