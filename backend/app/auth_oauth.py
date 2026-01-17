"""
Google OAuth routes for Bags & Brats
"""
from flask import Blueprint, jsonify, request, redirect, current_app
from flask_jwt_extended import create_access_token
from authlib.integrations.requests_client import OAuth2Session
from app.models import User
from app import mongo

oauth_bp = Blueprint('oauth', __name__)

# Google OAuth endpoints
GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'


def get_google_client():
    """Create OAuth2 session for Google"""
    return OAuth2Session(
        client_id=current_app.config['GOOGLE_CLIENT_ID'],
        client_secret=current_app.config['GOOGLE_CLIENT_SECRET'],
        redirect_uri=current_app.config['GOOGLE_REDIRECT_URI'],
        scope='openid email profile'
    )


@oauth_bp.route('/auth/google', methods=['GET'])
def google_login():
    """Redirect user to Google for authentication"""
    client = get_google_client()
    uri, state = client.create_authorization_url(GOOGLE_AUTHORIZE_URL)
    return jsonify({"auth_url": uri})


@oauth_bp.route('/auth/google/callback', methods=['GET'])
def google_callback():
    """Handle callback from Google OAuth"""
    code = request.args.get('code')
    error = request.args.get('error')
    
    if error:
        # Redirect to frontend with error
        frontend_url = current_app.config.get('FRONTEND_URL', 'https://efficient-insight-production.up.railway.app')
        return redirect(f"{frontend_url}/login?error={error}")
    
    if not code:
        return jsonify({"error": "No authorization code received"}), 400
    
    try:
        client = get_google_client()
        
        # Exchange code for token
        token = client.fetch_token(
            GOOGLE_TOKEN_URL,
            authorization_response=request.url,
            grant_type='authorization_code'
        )
        
        # Get user info from Google
        client.token = token
        resp = client.get(GOOGLE_USERINFO_URL)
        userinfo = resp.json()
        
        google_id = userinfo.get('sub')
        email = userinfo.get('email')
        name = userinfo.get('name')
        
        if not google_id or not email:
            return jsonify({"error": "Could not retrieve user info from Google"}), 400
        
        # Check if user exists by google_id
        user = User.find_by_google_id(mongo, google_id)
        
        if not user:
            # Check if email already exists (existing password user)
            existing_user = User.find_by_email(mongo, email)
            
            if existing_user:
                # Link Google account to existing user
                existing_user.google_id = google_id
                existing_user.save(mongo)
                user = existing_user
            else:
                # Create new user
                user = User({
                    'name': name,
                    'email': email,
                    'google_id': google_id,
                    'role': 'player',
                    'is_proxy': False
                })
                user.save(mongo)
        
        # Create JWT token
        access_token = create_access_token(identity=str(user._id))
        
        # Redirect to frontend with token
        frontend_url = current_app.config.get('FRONTEND_URL', 'https://efficient-insight-production.up.railway.app')
        return redirect(f"{frontend_url}/oauth-callback?token={access_token}&user_id={str(user._id)}&name={user.name}&role={user.role}")
        
    except Exception as e:
        print(f"OAuth error: {e}")
        return jsonify({"error": str(e)}), 500
