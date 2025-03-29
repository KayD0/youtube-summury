"""
Firebase Authentication Service for verifying ID tokens
"""
import os
import firebase_admin
from firebase_admin import credentials, auth
from functools import wraps
from flask import request, jsonify

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK with credentials from environment variables"""
    try:
        # Check if already initialized
        if not firebase_admin._apps:
            # Try to use service account credentials from environment variables
            if os.getenv('FIREBASE_PROJECT_ID'):
                cred_dict = {
                    "type": "service_account",
                    "project_id": os.getenv('FIREBASE_PROJECT_ID'),
                    "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
                    "private_key": os.getenv('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
                    "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
                    "client_id": os.getenv('FIREBASE_CLIENT_ID'),
                    "auth_uri": os.getenv('FIREBASE_AUTH_URI'),
                    "token_uri": os.getenv('FIREBASE_TOKEN_URI'),
                    "auth_provider_x509_cert_url": os.getenv('FIREBASE_AUTH_PROVIDER_X509_CERT_URL'),
                    "client_x509_cert_url": os.getenv('FIREBASE_CLIENT_X509_CERT_URL')
                }
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                print("Firebase Admin SDK initialized with service account credentials")
            else:
                # Use application default credentials if service account not provided
                firebase_admin.initialize_app()
                print("Firebase Admin SDK initialized with application default credentials")
        return True
    except Exception as e:
        print(f"Error initializing Firebase Admin SDK: {str(e)}")
        return False

# Decorator for routes that require authentication
def auth_required(f):
    """
    Decorator for Flask routes that require Firebase authentication.
    Verifies the ID token in the Authorization header and adds the decoded token to the request.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get the auth token from the request header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Authorization header is missing'}), 401
        
        # Extract the token (remove 'Bearer ' prefix if present)
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
        
        try:
            # Verify the token
            decoded_token = auth.verify_id_token(token)
            
            # Add the decoded token to the request object
            request.user = decoded_token
            
            # Continue with the route function
            return f(*args, **kwargs)
        except auth.InvalidIdTokenError:
            return jsonify({'error': 'Invalid authentication token'}), 401
        except auth.ExpiredIdTokenError:
            return jsonify({'error': 'Expired authentication token'}), 401
        except auth.RevokedIdTokenError:
            return jsonify({'error': 'Revoked authentication token'}), 401
        except auth.CertificateFetchError:
            return jsonify({'error': 'Error fetching certificates'}), 500
        except Exception as e:
            return jsonify({'error': f'Authentication error: {str(e)}'}), 500
    
    return decorated_function

# Function to verify a token without the decorator (for testing or custom handling)
def verify_token(token):
    """
    Verify a Firebase ID token and return the decoded token if valid.
    
    Args:
        token (str): The Firebase ID token to verify
        
    Returns:
        dict: The decoded token if valid
        
    Raises:
        Various firebase_admin.auth exceptions if the token is invalid
    """
    return auth.verify_id_token(token)
