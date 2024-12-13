from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from functools import wraps
import os
import secrets
from datetime import timedelta
from datetime import datetime
from urllib.parse import urlparse, urlencode, parse_qs
import uuid

# Define directory for messages
MESSAGE_DIR = "messages"
os.makedirs(MESSAGE_DIR, exist_ok=True)


app = Flask(__name__)
app.config.update(
    PERMANENT_SESSION_LIFETIME=timedelta(days=1),
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Strict',  # Changed from 'Lax' to 'Strict'
    SESSION_COOKIE_NAME='aeris_session',
    SESSION_REFRESH_EACH_REQUEST=True,
    PREFERRED_URL_SCHEME='https',
    SESSION_COOKIE_DOMAIN=None,
    MAX_CONTENT_LENGTH=16 * 1024 * 1024,
    # Add these settings for tab-specific sessions
    PERMANENT_SESSION=False,           # Don't make sessions permanent
    SESSION_PERMANENT=False,           # Reinforcing the non-permanent setting
    SESSION_COOKIE_PATH='/'            # Set cookie path
)
app.secret_key = 'MMMCOOKIESSSS-said-cookie-monster-hungrily' 

def maintain_tab_id(url):
    """Helper function to maintain tab_id when redirecting"""
    if 'authenticated' in session and session.get('tab_id'):
        # Parse the URL
        parsed = urlparse(url)
        # Get existing query parameters
        query_params = parse_qs(parsed.query)
        # Add or update tab_id
        query_params['tab_id'] = [session['tab_id']]
        # Rebuild query string
        new_query = urlencode(query_params, doseq=True)
        # Rebuild URL with new query string
        from urllib.parse import urlunparse
        return urlunparse((parsed.scheme, parsed.netloc, parsed.path, 
                          parsed.params, new_query, parsed.fragment))
    return url

def redirect_with_tab_id(endpoint, **kwargs):
    """Helper function for redirecting while maintaining tab_id"""
    url = url_for(endpoint, **kwargs)
    return redirect(maintain_tab_id(url))

@app.route('/check-auth', methods=['POST'])
def check_auth():
    is_authenticated = 'authenticated' in session
    if is_authenticated:
        # Force session refresh
        session.modified = True
        session.permanent = True
    return jsonify({
        "authenticated": is_authenticated
    })

def read_password(file_path="password.txt"):
    """Reads the password from the password.txt file."""
    with open(file_path, 'r') as f:
        return f.read().strip()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'authenticated' not in session:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({"authenticated": False}), 401
            return redirect(url_for('login', next=maintain_tab_id(request.path)))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/submit-message', methods=['POST'])
def submit_message():
    # Get the message and recipient from the form
    message = request.form.get('message', '').strip()
    recipient_email = request.form.get('_email', '').strip()
    recipient = recipient_email.split('@')[0]  # Extract recipient's name from email

    if message:
        # Create a unique filename with recipient name and timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"message_{recipient}_{timestamp}.html"
        filepath = os.path.join(MESSAGE_DIR, filename)
        
        # Save the message as an HTML file
        with open(filepath, 'w') as file:
            file.write(f"<html><body><h1>Message</h1><p>{message}</p></body></html>")
        
        # Optionally send an email
        send_email(recipient_email, "New Message Received", message)
    
    return jsonify({"success": True})


def send_email(to_email, subject, body):
    # Placeholder function for sending email
    # Use Flask-Mail, smtplib, or any email service here
    print(f"Sending email to {to_email}: {subject}\n{body}")

@app.route('/logs')
@login_required
def logs():
    """Render the logs page, showing all messages."""
    # Ensure the messages directory exists
    if not os.path.exists(MESSAGE_DIR):
        os.makedirs(MESSAGE_DIR)

    # Get all message files in the directory
    message_files = sorted(os.listdir(MESSAGE_DIR), reverse=True)
    return render_template('logs.html', message_files=message_files)

@app.route('/messages/<filename>')
def view_message(filename):
    # Prevent directory traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        return "Invalid filename", 400

    filepath = os.path.join(MESSAGE_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r') as file:
            return file.read()
    return "Message not found", 404

@app.route('/')
def index():
    return render_template('index.html', tab_id=request.args.get('tab_id'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        if request.is_json:
            password = request.json.get('password')
        else:
            password = request.form.get('password')

        if password == read_password():
            session.permanent = True
            session['authenticated'] = True
            session['tab_id'] = str(uuid.uuid4())
            
            next_url = request.json.get('next') or request.args.get('next') or '/'
            
            # Clean and maintain existing tab_id if present in next_url
            if '://' in next_url:
                next_url = urlparse(next_url).path + ('?' + urlparse(next_url).query if urlparse(next_url).query else '')
            
            next_url = maintain_tab_id(next_url)
            
            if request.is_json:
                return jsonify({
                    "success": True,
                    "redirect_url": next_url
                })
            return redirect(next_url)
        
        if request.is_json:
            return jsonify({"success": False, "message": "Incorrect password"})
        return render_template('login.html', error="Incorrect password")
    
    return render_template('login.html')

@app.before_request
def before_request():
    # Skip auth check for static files
    if request.path.startswith('/static/') and not 'authenticated' in session:
        return
        
    if not request.is_secure and not request.headers.get('X-Forwarded-Proto', 'http') == 'https':
        if request.url.startswith('http://'):
            url = request.url.replace('http://', 'https://', 1)
            return redirect(url, code=301)
    
    # Only check tab_id for protected routes
    if 'authenticated' in session and request.endpoint in ['lab1_summary', 'lab2_summary', 'lab3_summary', 'aetas_summary', 'logs_list']:
        current_tab = request.args.get('tab_id')
        session_tab = session.get('tab_id')
        
        if not current_tab or not session_tab or current_tab != session_tab:
            session.clear()
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({"authenticated": False}), 401
            return redirect(url_for('login', next=request.full_path))

# Protected routes
@app.route('/lab1_summary')
@login_required
def lab1_summary():
    return render_template('lab1.html')

@app.route('/lab2_summary')
@login_required
def lab2_summary():
    return render_template('lab2.html')

@app.route('/lab3_summary')
@login_required
def lab3_summary():
    return render_template('lab3.html')

@app.route('/aetas_summary')
@login_required
def aetas_summary():
    return render_template('calendar.html')


# Redirect routes
@app.route('/lab1')
@login_required
def lab1():
    return redirect_with_tab_id('lab1_summary')

@app.route('/lab2')
@login_required
def lab2():
    return redirect_with_tab_id('lab2_summary')

@app.route('/lab3')
@login_required
def lab3():
    return redirect_with_tab_id('lab3_summary')

@app.route('/aetas')
@login_required
def aetas():
    return redirect_with_tab_id('aetas_summary')

@app.route('/logs_list')
@login_required
def logs_list():
    return redirect_with_tab_id('logs')

# Team routes (unprotected)
# @app.route('/team/kaylee.html')
# def kaylee():
#     return render_template('kaylee.html', tab_id=request.args.get('tab_id'))

# @app.route('/team/luke.html')
# def luke():
#     return render_template('luke.html', tab_id=request.args.get('tab_id'))

@app.route('/elizabeth.html')
def elizabeth():
    return render_template('elizabeth.html', tab_id=request.args.get('tab_id'))

# @app.route('/team/gavin.html')
# def gavin():
#     return render_template('gavin.html', tab_id=request.args.get('tab_id'))

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))