# YouTube Search API

A Flask API that allows searching for YouTube videos using keywords.

## Setup

### Prerequisites

- Python 3.7 or higher
- A Google API key with YouTube Data API v3 enabled

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install the required dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file based on the `.env.example` file:

```bash
cp .env.example .env
```

5. Edit the `.env` file and add your YouTube API key:

```
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### Getting a YouTube API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API key)
5. Copy the API key to your `.env` file

## Running the API

Start the Flask development server:

```bash
python app.py
```

The API will be available at `http://localhost:5000`.

## API Endpoints

### GET /

Returns a simple message to verify the API is running.

### GET /api/search

Search for YouTube videos based on a keyword.

#### Query Parameters

- `q`: The search query (required)
- `max_results`: Maximum number of results to return (optional, default: 10)

#### Example Request

```
GET /api/search?q=python+tutorial&max_results=5
```

#### Example Response

```json
{
  "query": "python tutorial",
  "count": 5,
  "videos": [
    {
      "id": "video_id",
      "title": "Python Tutorial for Beginners",
      "description": "Learn Python programming in this comprehensive tutorial...",
      "thumbnail": "https://i.ytimg.com/vi/video_id/mqdefault.jpg",
      "channel_title": "Programming Channel",
      "published_at": "2023-01-01T00:00:00Z"
    },
    // More videos...
  ]
}
```

## Error Handling

The API returns appropriate error messages and status codes:

- 400 Bad Request: Missing required parameters
- 500 Internal Server Error: YouTube API errors or server errors
