"""
OAuth routes for Bags & Brats (Google + Apple Sign In)
"""
from flask import Blueprint, jsonify, request, redirect, current_app
from flask_jwt_extended import create_access_token
from authlib.integrations.requests_client import OAuth2Session
from app.models import User
from app import mongo
import jwt
import time
import requests

oauth_bp = Blueprint('oauth', __name__)

# Google OAuth endpoints
GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

# Apple OAuth endpoints
APPLE_AUTHORIZE_URL = 'https://appleid.apple.com/auth/authorize'
APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token'


def get_google_client():
    """Create OAuth2 session for Google"""
    return OAuth2Session(
        client_id=current_app.config['GOOGLE_CLIENT_ID'],
        client_secret=current_app.config['GOOGLE_CLIENT_SECRET'],
        redirect_uri=current_app.config['GOOGLE_REDIRECT_URI'],
        scope='openid email profile'
    )


def generate_apple_client_secret():
    """Generate JWT client secret for Apple Sign In.
    Apple requires a JWT signed with your private key instead of a static client_secret.
    """
    team_id = current_app.config['APPLE_TEAM_ID']
    client_id = current_app.config['APPLE_CLIENT_ID']
    key_id = current_app.config['APPLE_KEY_ID']
    private_key = current_app.config['APPLE_PRIVATE_KEY']
    
    now = int(time.time())
    payload = {
        'iss': team_id,
        'iat': now,
        'exp': now + 86400 * 180,  # 180 days max
        'aud': 'https://appleid.apple.com',
        'sub': client_id
    }
    
    headers = {
        'kid': key_id,
        'alg': 'ES256'
    }
    
    return jwt.encode(payload, private_key, algorithm='ES256', headers=headers)


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


# ============ Apple Sign In ============

@oauth_bp.route('/auth/apple', methods=['GET'])
def apple_login():
    """Return Apple authorization URL"""
    client_id = current_app.config['APPLE_CLIENT_ID']
    redirect_uri = current_app.config['APPLE_REDIRECT_URI']
    
    # Apple requires response_mode=form_post for web
    auth_url = (
        f"{APPLE_AUTHORIZE_URL}?"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope=name email&"
        f"response_mode=form_post"
    )
    
    return jsonify({"auth_url": auth_url})


@oauth_bp.route('/auth/apple/callback', methods=['POST'])
def apple_callback():
    """Handle callback from Apple OAuth (Apple POSTs form data, not GET)"""
    code = request.form.get('code')
    error = request.form.get('error')
    user_data = request.form.get('user')  # Only sent on first sign-in
    
    frontend_url = current_app.config.get('FRONTEND_URL', 'https://efficient-insight-production.up.railway.app')
    
    if error:
        return redirect(f"{frontend_url}/login?error={error}")
    
    if not code:
        return redirect(f"{frontend_url}/login?error=no_code")
    
    try:
        # Exchange code for tokens
        client_id = current_app.config['APPLE_CLIENT_ID']
        client_secret = generate_apple_client_secret()
        redirect_uri = current_app.config['APPLE_REDIRECT_URI']
        
        token_response = requests.post(APPLE_TOKEN_URL, data={
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri
        })
        
        if token_response.status_code != 200:
            print(f"Apple token error: {token_response.text}")
            return redirect(f"{frontend_url}/login?error=token_failed")
        
        tokens = token_response.json()
        id_token = tokens.get('id_token')
        
        if not id_token:
            return redirect(f"{frontend_url}/login?error=no_id_token")
        
        # Decode the id_token (Apple's JWT) to get user info
        # Note: In production, you should verify the signature with Apple's public keys
        decoded = jwt.decode(id_token, options={"verify_signature": False})
        
        apple_id = decoded.get('sub')
        email = decoded.get('email')
        
        # Get name from user data if this is first sign-in
        name = None
        if user_data:
            import json
            user_info = json.loads(user_data)
            first_name = user_info.get('name', {}).get('firstName', '')
            last_name = user_info.get('name', {}).get('lastName', '')
            name = f"{first_name} {last_name}".strip()
        
        if not apple_id:
            return redirect(f"{frontend_url}/login?error=no_apple_id")
        
        # Check if user exists by apple_id
        user = User.find_by_apple_id(mongo, apple_id)
        
        if not user:
            # Check if email already exists (existing user)
            if email:
                existing_user = User.find_by_email(mongo, email)
                if existing_user:
                    # Link Apple account to existing user
                    existing_user.apple_id = apple_id
                    existing_user.save(mongo)
                    user = existing_user
            
            if not user:
                # Create new user
                user = User({
                    'name': name or email or 'Apple User',
                    'email': email,
                    'apple_id': apple_id,
                    'role': 'player',
                    'is_proxy': False
                })
                user.save(mongo)
        
        # Create JWT token
        access_token = create_access_token(identity=str(user._id))
        
        # Redirect to frontend with token
        return redirect(f"{frontend_url}/oauth-callback?token={access_token}&user_id={str(user._id)}&name={user.name}&role={user.role}")
        
    except Exception as e:
        print(f"Apple OAuth error: {e}")
        import traceback
        traceback.print_exc()
        return redirect(f"{frontend_url}/login?error=apple_auth_failed")
