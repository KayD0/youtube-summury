import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GeminiService:
    """Service class for handling Vertex AI Gemini model operations."""
    
    def __init__(self):
        """Initialize the Gemini service with configuration from environment variables."""
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.model_id = os.getenv('GEMINI_MODEL_ID', 'gemini-1.5-pro')
        self.api_endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_id}:generateContent"
    
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
    
    def generate_summary(self, video_id, youtube_service, language=None, format_type="json"):
        """
        Generate a summary for a YouTube video using Vertex AI Gemini.
        
        Args:
            video_id (str): YouTube video ID
            youtube_service (YouTubeService): Instance of YouTubeService
            language (str, optional): Language for the summary
            format_type (str, optional): Format type for the summary ("json" or "markdown")
            
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
            
            # Create a prompt for Gemini based on format type
            if format_type == "markdown":
                prompt = f"""
                以下のYouTube動画のトランスクリプトに基づいて、Markdown形式で詳細な要約を生成してください。
                この要約は情報共有や外部への展開に適した形式にしてください。

                - 動画タイトル: {video_details.get('title', '不明')}
                - 動画ID: {video_id}
                - チャンネル名: {video_details.get('channel_title', '不明')}
                - 公開日: {video_details.get('published_at', '不明')}

                - トランスクリプト: {transcript}

                以下の構造でMarkdown形式の要約を作成してください：

                1. 見出し（# 動画タイトル）
                2. 概要情報（公開日、チャンネル名、動画URLなど）
                3. 簡潔な要約（2～3段落）- 動画の主要な内容を簡潔に説明
                4. 重要なポイント（箇条書き）- 動画から得られる主要な学びや情報
                5. 詳細な内容（小見出しと説明）- 動画の主要なセクションごとに詳細な説明
                6. 結論 - 動画の結論や視聴者へのメッセージ
                7. 関連リソース（もし言及されていれば）

                Markdownの構文を正しく使用してください：
                - 見出しには # ## ### を適切に使用
                - 重要な点は **太字** で強調
                - 引用が必要な場合は > を使用
                - コードやコマンドは ``` で囲む
                - 表やリンクも適切に使用

                要約は情報が豊富で、読みやすく、共有しやすいものにしてください。
                技術的な内容や専門用語がある場合は、簡潔な説明を追加してください。
                
                また、以下のJSON形式でメタデータも提供してください：
                ```json
                {{
                    "brief_summary": "...",
                    "key_points": ["...", "...", "..."],
                    "main_topics": ["...", "...", "..."],
                    "markdown_content": "（上記で生成したMarkdown形式の要約全体）"
                }}
                ```
                """
            else:
                prompt = f"""
                以下のYouTube動画のトランスクリプトに基づいて、簡潔な要約を生成してください。

                - 動画タイトル: {video_details.get('title', '不明')}
                - 動画ID: {video_id}

                - トランスクリプト: {transcript}

                以下を提供してください：
                1. 簡潔な要約（2～3文）
                2. 重要なポイント（3～5箇条書き）
                3. 主な議論内容

                以下のJSON形式で回答を記述してください：
                {{
                    "brief_summary": "...",
                    "key_points": ["...", "...", "..."],
                    "main_topics": ["...", "...", "..."]
                }}
                """
            
            # Prepare request payload
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": prompt}]
                    }
                ]
            }
            
            # Make API request with API key authentication
            response = requests.post(
                f"{self.api_endpoint}?key={self.api_key}",
                headers={"Content-Type": "application/json"},
                json=payload
            )
            
            # Check for errors
            if response.status_code != 200:
                error_message = response.json().get('error', {}).get('message', f"API error: {response.status_code}")
                raise Exception(error_message)
            
            # Parse the response
            response_data = response.json()
            response_text = response_data["candidates"][0]["content"]["parts"][0]["text"]
            
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
            
            # Add video title to the response
            if video_details and 'title' in video_details:
                summary_data["video_title"] = video_details['title']
            
            return summary_data
            
        except Exception as e:
            print(f"Error generating summary: {str(e)}")
            raise e
