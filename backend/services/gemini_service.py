import os
from google.cloud import aiplatform
from google.protobuf import json_format
from google.protobuf.struct_pb2 import Value
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GeminiService:
    """Service class for handling Vertex AI Gemini model operations."""
    
    def __init__(self):
        """Initialize the Gemini service with configuration from environment variables."""
        self.project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
        self.location = os.getenv('GOOGLE_CLOUD_LOCATION', 'us-central1')
        self.model_id = os.getenv('GEMINI_MODEL_ID', 'gemini-1.5-pro')
        
        # Initialize Vertex AI
        aiplatform.init(project=self.project_id, location=self.location)
    
    def _get_transcript(self, video_id, youtube_service):
        """
        Get transcript for a YouTube video.
        
        Args:
            video_id (str): YouTube video ID
            youtube_service (YouTubeService): Instance of YouTubeService
            
        Returns:
            str: Video transcript or None if not available
        """
        try:
            # Use the YouTube service to get the transcript
            # Prioritize Japanese and English transcripts
            transcript_result = youtube_service.get_transcript(video_id, language_codes=['ja', 'en'])
            
            if transcript_result['success']:
                return transcript_result['transcript']
            else:
                print(f"Transcript error: {transcript_result['error']}")
                return None
        except Exception as e:
            print(f"Error getting transcript: {str(e)}")
            return None
    
    def _get_video_details(self, video_id, youtube_service):
        """
        Get details for a YouTube video.
        
        Args:
            video_id (str): YouTube video ID
            youtube_service (YouTubeService): Instance of YouTubeService
            
        Returns:
            dict: Video details or None if not available
        """
        try:
            # Use the YouTube service to get video details
            return youtube_service._get_video_details(video_id)
        except Exception as e:
            print(f"Error getting video details: {str(e)}")
            return None
    
    def generate_summary(self, video_id, youtube_service, language=None):
        """
        Generate a summary for a YouTube video using Vertex AI Gemini.
        
        Args:
            video_id (str): YouTube video ID
            youtube_service (YouTubeService): Instance of YouTubeService
            
        Returns:
            dict: Summary information
            
        Raises:
            Exception: If there's an error generating the summary
        """
        try:
            # Get video transcript
            transcript = self._get_transcript(video_id, youtube_service)
            if not transcript:
                return {"error": "Could not retrieve video transcript"}
            
            # Get video details
            video_details = self._get_video_details(video_id, youtube_service)
            if not video_details:
                return {"error": "Could not retrieve video details"}
            
            # Create a prompt for Gemini
            prompt = f"""
            Please generate a concise summary of the following YouTube video transcript.
            
            Video Title: {video_details.get('title', 'Unknown')}
            Video ID: {video_id}
            
            Transcript:
            {transcript}
            
            Please provide:
            1. A brief summary (2-3 sentences)
            2. Key points (3-5 bullet points)
            3. Main topics discussed
            
            Format the response as JSON with the following structure:
            {{
                "brief_summary": "...",
                "key_points": ["...", "...", "..."],
                "main_topics": ["...", "...", "..."]
            }}
            """
            
            # Call Vertex AI Gemini model
            endpoint = aiplatform.Endpoint(f"projects/{self.project_id}/locations/{self.location}/publishers/google/models/{self.model_id}")
            
            instances_json = json.dumps({
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": prompt}]
                    }
                ]
            })
            instances = [json_format.ParseDict(json.loads(instances_json), Value())]
            
            response = endpoint.predict(instances=instances)
            
            # Parse the response
            response_text = response.predictions[0]["candidates"][0]["content"]["parts"][0]["text"]
            
            # Extract JSON from the response
            try:
                # Try to parse the entire response as JSON
                summary_data = json.loads(response_text)
            except json.JSONDecodeError:
                # If that fails, try to extract JSON from the text
                import re
                json_match = re.search(r'```json\n(.*?)\n```', response_text, re.DOTALL)
                if json_match:
                    summary_data = json.loads(json_match.group(1))
                else:
                    # If no JSON found, create a basic structure with the full text
                    summary_data = {
                        "brief_summary": response_text[:200] + "...",
                        "key_points": ["Could not parse structured data from model response"],
                        "main_topics": ["Could not parse structured data from model response"]
                    }
            
            # Add video details to the response
            summary_data["video_id"] = video_id
            summary_data["video_url"] = f"https://www.youtube.com/watch?v={video_id}"
            
            return summary_data
            
        except Exception as e:
            print(f"Error generating summary: {str(e)}")
            raise e
