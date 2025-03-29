/**
 * API Service for making requests to the backend
 */

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Search for YouTube videos
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
        const response = await fetch(`${API_BASE_URL}/api/search`, {
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
 * Generate a summary for a YouTube video
 * 
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Summary data
 */
export async function generateVideoSummary(videoId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/summarize`, {
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
