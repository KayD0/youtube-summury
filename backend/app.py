from flask import Flask, request, jsonify
from flask_cors import CORS
from googleapiclient.errors import HttpError
import os
from dotenv import load_dotenv

# Import services
from services.youtube_service import YouTubeService
from services.gemini_service import GeminiService
from services.auth_service import initialize_firebase, auth_required

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS
CORS_ORIGIN = os.getenv('CORS_ORIGIN', 'http://localhost:3000')
CORS(app, resources={r"/api/*": {"origins": CORS_ORIGIN}})

# Get YouTube API key from environment variables
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

# Create service instances
youtube_service = YouTubeService(YOUTUBE_API_KEY)
gemini_service = GeminiService()

# Initialize Firebase Admin SDK
firebase_initialized = initialize_firebase()
if not firebase_initialized:
    print("Warning: Firebase Admin SDK initialization failed")


@app.route('/api/search', methods=['POST'])
@auth_required
def search_videos():
    """
    Search for YouTube videos based on a keyword.
    
    JSON body parameters:
    - q: The search query (required)
    - max_results: Maximum number of results to return (optional, default: 10)
    - channel_id: Filter by channel ID (optional)
    - published_after: Filter videos published after this date (optional, ISO 8601 format)
    
    Returns:
    - JSON response with video information
    """
    # Get JSON data from request body
    data = request.get_json()
    
    # Extract parameters from JSON
    query = data.get('q')
    max_results = data.get('max_results', 10)
    channel_id = data.get('channel_id')
    published_after = data.get('published_after')
    
    # Validate query parameter
    if not query:
        return jsonify({'error': 'Missing query parameter (q)'}), 400
    
    try:
        # Use the service to search for videos
        result = youtube_service.search_videos(
            query=query,
            max_results=max_results,
            channel_id=channel_id,
            published_after=published_after
        )
        
        return jsonify(result)
    
    except HttpError as e:
        return jsonify({'error': f'YouTube API error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@app.route('/api/summarize', methods=['POST'])
@auth_required
def summarize_video():
    """
    Generate a summary for a YouTube video using Vertex AI Gemini.
    
    JSON body parameters:
    - video_id: The YouTube video ID (required)
    
    Returns:
    - JSON response with summary information
    """
    # Get JSON data from request body
    data = request.get_json()
    
    # Extract parameters from JSON
    video_id = data.get('video_id')
    
    # Validate video_id parameter
    if not video_id:
        return jsonify({'error': 'Missing video_id parameter'}), 400
    
    try:
        # Use the Gemini service to generate a summary
        result = gemini_service.generate_summary(video_id, youtube_service)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': f'Summary generation error: {str(e)}'}), 500


@app.route('/api/auth/verify', methods=['POST'])
@auth_required
def verify_auth():
    """
    Verify the authentication token and return user information.
    This endpoint is protected by the auth_required decorator.
    
    Returns:
    - JSON response with user information from the decoded token
    """
    # The auth_required decorator adds the decoded token to request.user
    user_info = request.user
    
    # Return user information
    return jsonify({
        'authenticated': True,
        'user': {
            'uid': user_info.get('uid'),
            'email': user_info.get('email'),
            'email_verified': user_info.get('email_verified', False),
            'auth_time': user_info.get('auth_time')
        }
    })


@app.route('/')
def index():
    """Simple index route to verify the API is running."""
    return jsonify({
        'message': 'YouTube Search and Summary API is running',
        'endpoints': {
            'search': '/api/search (POST with JSON body)',
            'summarize': '/api/summarize (POST with JSON body)',
            'auth_verify': '/api/auth/verify (POST with Authorization header)'
        }
    })


if __name__ == '__main__':
    # Check if API key is set
    if not YOUTUBE_API_KEY:
        print("Warning: YOUTUBE_API_KEY is not set in .env file")
    
    # Run the Flask app
    app.run(debug=True)
