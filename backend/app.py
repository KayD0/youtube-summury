from flask import Flask, request, jsonify
from googleapiclient.errors import HttpError
import os
from dotenv import load_dotenv

# Import the YouTubeService from the services package
from services.youtube_service import YouTubeService

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Get YouTube API key from environment variables
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

# Create YouTube service instance
youtube_service = YouTubeService(YOUTUBE_API_KEY)


@app.route('/api/search', methods=['POST'])
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


@app.route('/')
def index():
    """Simple index route to verify the API is running."""
    return jsonify({
        'message': 'YouTube Search API is running',
        'endpoints': {
            'search': '/api/search (POST with JSON body)'
        }
    })


if __name__ == '__main__':
    # Check if API key is set
    if not YOUTUBE_API_KEY:
        print("Warning: YOUTUBE_API_KEY is not set in .env file")
    
    # Run the Flask app
    app.run(debug=True)
