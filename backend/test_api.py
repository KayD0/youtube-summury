import requests
import json
import sys

def test_search_api(query, max_results=5):
    """Test the YouTube search API with a given query."""
    base_url = "http://localhost:5000"
    
    # First, check if the API is running
    try:
        response = requests.get(base_url)
        if response.status_code != 200:
            print(f"Error: API returned status code {response.status_code}")
            return
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API. Make sure it's running with 'python app.py'")
        return
    
    # Make the search request
    search_url = f"{base_url}/api/search"
    params = {
        'q': query,
        'max_results': max_results
    }
    
    try:
        response = requests.get(search_url, params=params)
        
        # Check if the request was successful
        if response.status_code == 200:
            data = response.json()
            
            # Print the results in a readable format
            print(f"\nSearch results for: '{query}'")
            print(f"Found {data['count']} videos\n")
            
            for i, video in enumerate(data['videos'], 1):
                print(f"{i}. {video['title']}")
                print(f"   Channel: {video['channel_title']}")
                print(f"   URL: https://www.youtube.com/watch?v={video['id']}")
                print(f"   Published: {video['published_at']}")
                print(f"   Thumbnail: {video['thumbnail']}")
                print(f"   Description: {video['description'][:100]}...")
                print()
        else:
            print(f"Error: API returned status code {response.status_code}")
            print(response.json())
    
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    # Get search query from command line arguments or use default
    query = sys.argv[1] if len(sys.argv) > 1 else "python programming"
    
    # Get max results from command line arguments or use default
    max_results = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    
    test_search_api(query, max_results)
