"""
Test script for Firebase authentication verification
"""
import requests
import json
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API base URL
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5000')

def test_auth_verification(token=None):
    """
    Test the authentication verification endpoint
    
    Args:
        token (str, optional): Firebase ID token to use for authentication
    """
    if not token:
        print("No token provided. Testing unauthorized access...")
        # Test without token
        try:
            response = requests.post(f"{API_BASE_URL}/api/auth/verify")
            print(f"Status code: {response.status_code}")
            print(f"Response: {response.text}")
        except Exception as e:
            print(f"Error: {str(e)}")
        
        # Test with invalid token
        try:
            headers = {"Authorization": "Bearer invalid_token"}
            response = requests.post(f"{API_BASE_URL}/api/auth/verify", headers=headers)
            print(f"Status code with invalid token: {response.status_code}")
            print(f"Response with invalid token: {response.text}")
        except Exception as e:
            print(f"Error with invalid token: {str(e)}")
    else:
        print(f"Testing with provided token...")
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.post(f"{API_BASE_URL}/api/auth/verify", headers=headers)
            print(f"Status code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                # Test the search endpoint
                search_data = {
                    "q": "python programming",
                    "max_results": 5
                }
                response = requests.post(
                    f"{API_BASE_URL}/api/search", 
                    headers=headers,
                    json=search_data
                )
                print(f"\nSearch endpoint status code: {response.status_code}")
                if response.status_code == 200:
                    print(f"Search returned {len(response.json().get('videos', []))} videos")
                else:
                    print(f"Search response: {response.text}")
        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    # Check if token is provided as command line argument
    token = sys.argv[1] if len(sys.argv) > 1 else None
    test_auth_verification(token)
