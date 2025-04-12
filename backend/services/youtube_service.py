from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
import json


class YouTubeService:
    """Service class for handling YouTube API operations."""
    
    def __init__(self, api_key):
        """Initialize the service with an API key."""
        self.api_key = api_key
        self.youtube = self._create_youtube_client()
    
    def _create_youtube_client(self):
        """Create and return a YouTube API client."""
        return build('youtube', 'v3', developerKey=self.api_key)
    
    def search_videos(self, query, max_results=10, channel_id=None, published_after=None):
        """
        Search for YouTube videos based on parameters.
        
        Args:
            query (str): The search query
            max_results (int): Maximum number of results to return
            channel_id (str, optional): Filter by channel ID
            published_after (str, optional): Filter videos published after this date (ISO 8601 format)
            
        Returns:
            dict: Search results with video information
        
        Raises:
            HttpError: If there's an error with the YouTube API
            Exception: For any other errors
        """
        try:
            # Prepare search parameters
            search_params = {
                'q': query,
                'part': 'snippet',
                'maxResults': max_results,
                'type': 'video',
                'order': 'date',
                'regionCode': 'JP'
            }
            
            # Add optional parameters if provided
            if channel_id:
                search_params['channelId'] = channel_id
                
            if published_after:
                search_params['publishedAfter'] = published_after
            
            # Call the search.list method to retrieve results
            search_response = self.youtube.search().list(**search_params
            ).execute()
            
            # Extract relevant information from the response
            videos = []
            for item in search_response.get('items', []):
                video_id = item['id']['videoId']
                video_url = f"https://www.youtube.com/watch?v={video_id}"
                
                # Get detailed video information
                video_details = self._get_video_details(video_id)
                
                video = {
                    'id': video_id,
                    'title': item['snippet']['title'],
                    'description': item['snippet']['description'],
                    'thumbnail': item['snippet']['thumbnails']['medium']['url'],
                    'channel_id': item['snippet']['channelId'],
                    'channel_title': item['snippet']['channelTitle'],
                    'published_at': item['snippet']['publishedAt'],
                    'view_count': video_details.get('view_count', 'N/A'),
                    'like_count': video_details.get('like_count', 'N/A'),
                    'comment_count': video_details.get('comment_count', 'N/A'),
                    'url': video_url
                }
                videos.append(video)
            
            return {
                'query': query,
                'count': len(videos),
                'videos': videos
            }
            
        except HttpError as e:
            raise e
        except Exception as e:
            raise e
    
    def get_transcript(self, video_id, language_codes=None):
        """
        Get transcript for a YouTube video.
        
        Args:
            video_id (str): The YouTube video ID
            language_codes (list, optional): List of language codes to prioritize, e.g. ['ja', 'en']
                                            If None, will try to get the default transcript
        
        Returns:
            dict: {
                'success': bool,
                'transcript': str or None,
                'language': str or None,
                'error': str or None
            }
        """
        try:
            # If language_codes is not provided, get all available transcripts
            if language_codes is None:
                transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
                
                # Try to get the transcript in the original language first
                try:
                    transcript = transcript_list.find_transcript(['ja', 'en'])
                except NoTranscriptFound:
                    # If original language not found, get the first available transcript
                    transcript = next(transcript_list._transcripts.values().__iter__())
            else:
                # Try to get transcript in one of the specified languages
                transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
                transcript = transcript_list.find_transcript(language_codes)
            
            # Get the transcript data
            transcript_data = transcript.fetch()
            
            # Combine all transcript parts into a single string
            full_transcript = ' '.join([item['text'] for item in transcript_data])
            
            return {
                'success': True,
                'transcript': full_transcript,
                'language': transcript.language_code,
                'error': None,
                'raw_data': transcript_data  # Include raw data for more detailed processing if needed
            }
            
        except TranscriptsDisabled:
            return {
                'success': False,
                'transcript': None,
                'language': None,
                'error': 'Transcripts are disabled for this video'
            }
        except NoTranscriptFound:
            return {
                'success': False,
                'transcript': None,
                'language': None,
                'error': 'No transcript found for the specified languages'
            }
        except Exception as e:
            return {
                'success': False,
                'transcript': None,
                'language': None,
                'error': f'Error retrieving transcript: {str(e)}'
            }
    
    def _get_video_details(self, video_id):
        """
        Get detailed information for a specific video.
        
        Args:
            video_id (str): The YouTube video ID
            
        Returns:
            dict: Video statistics
        """
        video_response = self.youtube.videos().list(
            part='snippet,statistics',
            id=video_id
        ).execute()
        
        if not video_response.get('items'):
            return {}
            
        video_info = video_response['items'][0]
        statistics = video_info.get('statistics', {})
        
        return {
            'view_count': statistics.get('viewCount', 'N/A'),
            'like_count': statistics.get('likeCount', 'N/A'),
            'comment_count': statistics.get('commentCount', 'N/A')
        }
    
    def get_channel_info(self, channel_id):
        """
        チャンネルの詳細情報を取得します。
        
        Args:
            channel_id (str): YouTubeチャンネルID
            
        Returns:
            dict: チャンネル情報（タイトル、サムネイル、説明など）
            None: チャンネルが見つからない場合
        """
        try:
            # チャンネル情報を取得
            channel_response = self.youtube.channels().list(
                part='snippet,statistics',
                id=channel_id
            ).execute()
            
            # チャンネルが見つからない場合
            if not channel_response.get('items'):
                return None
                
            channel_info = channel_response['items'][0]
            snippet = channel_info.get('snippet', {})
            statistics = channel_info.get('statistics', {})
            
            # サムネイル画像のURLを取得（利用可能な最高品質）
            thumbnails = snippet.get('thumbnails', {})
            thumbnail_url = None
            for quality in ['high', 'medium', 'default']:
                if quality in thumbnails:
                    thumbnail_url = thumbnails[quality]['url']
                    break
            
            return {
                'id': channel_id,
                'title': snippet.get('title', '不明なチャンネル'),
                'description': snippet.get('description', ''),
                'thumbnail': thumbnail_url,
                'published_at': snippet.get('publishedAt'),
                'subscriber_count': statistics.get('subscriberCount', 'N/A'),
                'video_count': statistics.get('videoCount', 'N/A'),
                'view_count': statistics.get('viewCount', 'N/A')
            }
            
        except HttpError as e:
            print(f"YouTube API エラー: {str(e)}")
            return None
        except Exception as e:
            print(f"チャンネル情報取得エラー: {str(e)}")
            return None
