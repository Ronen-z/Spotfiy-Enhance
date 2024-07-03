from flask import Flask, request, redirect, session, jsonify, render_template
from datetime import datetime
import os
import urllib.parse
import requests
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

app = Flask("__name__", static_folder = 'static', static_url_path='/static')
app.secret_key = os.getenv('SECRET_KEY')


CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
REDIRECT_URI = os.getenv('REDIRECT_URI')

AUTH_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = "https://accounts.spotify.com/api/token"
API_BASE_URL = 'https://api.spotify.com/v1/'

# Utility functions
def get_token_headers():
    # Retrieve the authorization headers using the access token from the session.
    return {'Authorization': f"Bearer {session.get('access_token')}"}

def refresh_spotify_token():
    # Refresh the Spotify access token using the refresh token.
    req_body = {
        'grant_type': 'refresh_token',
        'refresh_token': session.get('refresh_token'),
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }
    response = requests.post(TOKEN_URL, data=req_body)
    new_token_info = response.json()

    if 'access_token' in new_token_info:
        session['access_token'] = new_token_info['access_token']
        session['expires_at'] = datetime.now().timestamp() + new_token_info['expires_in']
    else:
        raise Exception("Failed to refresh token")

def token_required(f):
    def wrap(*args, **kwargs):
        if 'access_token' not in session:
            return redirect('/login')
        
        if datetime.now().timestamp() > session.get('expires_at', 0):
            try:
                refresh_spotify_token()
            except Exception as e:
                return jsonify({'error': 'Token refresh failed', 'message': str(e)}), 401
        
        return f(*args, **kwargs)
    wrap.__name__ = f.__name__
    return wrap

# Routes
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login')
def login():
    scope = 'user-read-private user-read-email playlist-read-private user-top-read user-read-recently-played'
    params = {
        'client_id': CLIENT_ID,
        'response_type': 'code',
        'scope': scope,
        'redirect_uri': REDIRECT_URI,
        'show_dialog': True
    }

    auth_url = f"{AUTH_URL}?{urllib.parse.urlencode(params)}"
    return redirect(auth_url)

@app.route('/callback')
def callback():
    if 'error' in request.args:
        return jsonify({"error": request.args['error']})
    
    if 'code' in request.args:
        req_body = {
            'code': request.args['code'],
            'grant_type': 'authorization_code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET
        }
        
        response = requests.post(TOKEN_URL, data=req_body)
        token_info = response.json()
        
        if 'access_token' in token_info:
            session['access_token'] = token_info['access_token']
            session['refresh_token'] = token_info['refresh_token']
            session['expires_at'] = datetime.now().timestamp() + token_info['expires_in']
            return redirect('/dashboard')
        else:
            return jsonify({"error": "Failed to retrieve access token"}), 401


#* Opens the dashboard
@app.route('/dashboard')
@token_required
def dashboard():
    return render_template('dashboard.html')

#* Get user profile
@app.route('/api/user-profile')
def user_profile():
    token = session.get('access_token')
    headers = {
        'Authorization': f'Bearer {token}'
    }
    response = requests.get('https://api.spotify.com/v1/me', headers=headers)
    return response.json()

#* Fetch the user playlists
@app.route('/api/playlists')
@token_required
def get_playlists():
    headers = get_token_headers()
    response = requests.get(API_BASE_URL + 'me/playlists', headers=headers)
    
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch playlists"}), response.status_code
    
    playlists = response.json()
    # return render_template('playlists.html', playlists=playlists['items'])
    return jsonify(playlists['items'])

#* Fetch the tracks inside the playlists
@app.route('/api/playlists/<playlist_id>/tracks')
@token_required
def get_playlist_tracks(playlist_id):
    headers = get_token_headers()
    all_tracks = []
    url = f"{API_BASE_URL}playlists/{playlist_id}/tracks"
    params = {'limit': 100}  # Adjust limit as needed, max is 100

    while url:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch playlist tracks"}), response.status_code
        
        data = response.json()
        all_tracks.extend(data['items'])
        url = data['next']  # Spotify API provides the URL for the next page

    return jsonify(all_tracks)

# Fetch recently played tracks
@app.route('/api/recently-played')
@token_required
def get_recently_played():
    headers = get_token_headers()
    recent_tracks = []
    response = requests.get(API_BASE_URL + 'me/player/recently-played', headers=headers)
    
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch recently played tracks"}), response.status_code
    recent_tracks = response.json()

    return jsonify(recent_tracks)

#* Fetch the top tracks of the user depending on the selected time (4 weeks, 6 months, 1 year)
@app.route('/api/listening-history')
@token_required
def get_listening_history():
    time_range = request.args.get('time_range', 'medium_term')  # Default to medium_term if not specified
    headers = get_token_headers()
    response = requests.get(API_BASE_URL + 'me/top/tracks', headers=headers, params={'time_range': time_range})
    
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch listening history"}), response.status_code
    
    top_tracks = response.json()
    return jsonify(top_tracks)

#* Fetch the top artists of the user depending on the selected time (4 weeks, 6 months, 1 year)
@app.route('/api/top-artists')
@token_required
def get_top_artists():
    time_range = request.args.get('time_range', 'medium_term')  # Default to medium_term if not specified
    headers = get_token_headers()
    response = requests.get(API_BASE_URL + 'me/top/artists', headers=headers, params={'time_range': time_range})
    
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch top artists"}), response.status_code
    
    top_artists = response.json()
    return jsonify(top_artists)



@app.route('/profile')
@token_required
def profile_page():
    return render_template('profile.html')

@app.route('/top-songs')
@token_required
def top_songs():
    return render_template('top-songs.html')

@app.route('/top-artists')
@token_required
def top_artists():
    return render_template('top-artists.html')

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()  # Clear all session data
    return redirect('/')  # Redirect to the home page or login page


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
