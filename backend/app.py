from flask import Flask, request, jsonify
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Get YouTube API key from environment variables
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

def get_youtube_service():
    """Build and return a YouTube API service object."""
    return build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

@app.route('/api/search', methods=['GET'])
def search_videos():
    """
    Search for YouTube videos based on a keyword.
    
    Query parameters:
    - q: The search query (required)
    - max_results: Maximum number of results to return (optional, default: 10)
    
    Returns:
    - JSON response with video information
    """
    # Get query parameters
    query = request.args.get('q')
    max_results = request.args.get('max_results', default=10, type=int)
    
    # Validate query parameter
    if not query:
        return jsonify({'error': 'Missing query parameter (q)'}), 400
    
    try:
        # Create YouTube API service
        youtube = get_youtube_service()
        
        # Call the search.list method to retrieve results
        search_response = youtube.search().list(
            q=query,
            part='snippet',
            maxResults=max_results,
            type='video'
        ).execute()
        
        # Extract relevant information from the response
        videos = []
        for item in search_response.get('items', []):
            video = {
                'id': item['id']['videoId'],
                'title': item['snippet']['title'],
                'description': item['snippet']['description'],
                'thumbnail': item['snippet']['thumbnails']['medium']['url'],
                'channel_title': item['snippet']['channelTitle'],
                'published_at': item['snippet']['publishedAt']
            }
            videos.append(video)
        
        return jsonify({
            'query': query,
            'count': len(videos),
            'videos': videos
        })
    
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
            'search': '/api/search?q=your_search_query'
        }
    })

if __name__ == '__main__':
    # Check if API key is set
    if not YOUTUBE_API_KEY:
        print("Warning: YOUTUBE_API_KEY is not set in .env file")
    
    # Run the Flask app
    app.run(debug=True)
