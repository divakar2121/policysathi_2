import os
import secrets
from flask import Flask, render_template, redirect, url_for, session, request, jsonify
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
import google.auth.transport.requests
import requests as requests_lib
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set template and static folders
template_dir = os.path.abspath('./frontend/templates')
static_dir = os.path.abspath('./frontend')

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
# Generate a secret key if not set in environment
app.secret_key = os.environ.get('FLASK_SECRET_KEY', secrets.token_hex(32))

# OAuth 2.0 configuration
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', 'http://localhost:5000/callback')

# Scopes for Google OAuth
SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
]

# Function to create the OAuth flow
def create_flow():
    client_config = {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "redirect_uris": [GOOGLE_REDIRECT_URI]
        }
    }
    flow = Flow.from_client_config(
        client_config=client_config,
        scopes=SCOPES,
        redirect_uri=GOOGLE_REDIRECT_URI
    )
    return flow

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    # Create flow instance
    flow = create_flow()
    
    # Generate a random state for CSRF protection
    state = secrets.token_urlsafe(16)
    session['oauth_state'] = state
    
    # Create authorization URL
    authorization_url, _ = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        state=state,
        prompt='consent'
    )
    
    return redirect(authorization_url)

@app.route('/callback')
def callback():
    # Check for error in response
    error = request.args.get('error')
    if error:
        return f'Error: {error}', 400
    
    # Get the authorization code and state from the request
    code = request.args.get('code')
    state = request.args.get('state')
    
    # Verify state to prevent CSRF
    if state != session.get('oauth_state'):
        return 'Invalid state parameter', 400
    
    # Create flow and exchange code for tokens
    flow = create_flow()
    flow.fetch_token(code=code)
    
    # Get credentials
    credentials = flow.credentials
    
    # Verify the ID token
    request_session = google.auth.transport.requests.Request()
    try:
        id_info = id_token.verify_oauth2_token(
            credentials.id_token, request_session, GOOGLE_CLIENT_ID
        )
    except ValueError as e:
        return f'Invalid token: {e}', 400
    
    # Store user info in session
    session['user'] = {
        'id': id_info.get('sub'),
        'email': id_info.get('email'),
        'name': id_info.get('name'),
        'picture': id_info.get('picture')
    }
    
    # Clear the OAuth state from session
    session.pop('oauth_state', None)
    
    return redirect(url_for('profile'))

@app.route('/profile')
def profile():
    if 'user' not in session:
        return redirect(url_for('index'))
    
    return render_template('profile.html', user=session['user'])

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

# API endpoint to get user info (optional)
@app.route('/api/user')
def api_user():
    if 'user' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    return jsonify(session['user'])

if __name__ == '__main__':
    # For development only; in production use a proper WSGI server
    app.run(host='0.0.0.0', port=5000, debug=True)