from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from functools import wraps
import os
import secrets
from datetime import timedelta
from datetime import datetime
from urllib.parse import urlparse
import uuid

# Define directory for messages
MESSAGE_DIR = "messages"
os.makedirs(MESSAGE_DIR, exist_ok=True)

app = Flask(__name__)
app.config.update(
    PERMANENT_SESSION_LIFETIME=timedelta(days=1),
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Strict',
    SESSION_COOKIE_NAME='aeris_session',
    SESSION_REFRESH_EACH_REQUEST=True,
    PREFERRED_URL_SCHEME='https',
    MAX_CONTENT_LENGTH=16 * 1024 * 1024
)
app.secret_key = secrets.token_hex(32)


# Helper Functions
def read_password(file_path="password.txt"):
    """Reads the password from the password.txt file."""
    with open(file_path, 'r') as f:
        return f.read().strip()


def login_required(f):
    """Decorator to protect routes with authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'authenticated' not in session:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({"authenticated": False}), 401
            return redirect(url_for('login', next=request.path))
        return f(*args, **kwargs)
    return decorated_function


# Routes
@app.route('/check-auth', methods=['POST'])
def check_auth():
    """Check if the user is authenticated."""
    is_authenticated = 'authenticated' in session
    if is_authenticated:
        # Refresh session
        session.modified = True
    return jsonify({"authenticated": is_authenticated})


@app.route('/login', methods=['GET', 'POST'])
def login():
    """Authenticate the user with a password."""
    if request.method == 'POST':
        password = request.json.get('password') if request.is_json else request.form.get('password')

        if password == read_password():
            # Set session details
            session.permanent = True
            session['authenticated'] = True
            session['tab_id'] = str(uuid.uuid4())
            next_url = request.args.get('next') or '/'
            return jsonify({"success": True, "redirect_url": next_url}) if request.is_json else redirect(next_url)

        # Invalid password
        return jsonify({"success": False, "message": "Incorrect password"}) if request.is_json else render_template(
            'login.html', error="Incorrect password")

    # Render login page for GET requests
    return render_template('login.html')


@app.route('/submit-message', methods=['POST'])
def submit_message():
    """Save a submitted message as an HTML file."""
    message = request.form.get('message', '').strip()
    if message:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"message_{timestamp}.html"
        filepath = os.path.join(MESSAGE_DIR, filename)

        with open(filepath, 'w') as file:
            file.write(f"<html><body><h1>Message</h1><p>{message}</p></body></html>")

    return jsonify({"success": True})


@app.route('/logs')
@login_required
def logs():
    """Render the logs page."""
    message_files = sorted(os.listdir(MESSAGE_DIR), reverse=True)
    return render_template('logs.html', message_files=message_files)


@app.route('/messages/<filename>')
@login_required
def view_message(filename):
    """View a specific message file."""
    filepath = os.path.join(MESSAGE_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r') as file:
            return file.read()
    return "Message not found", 404


@app.route('/')
def index():
    """Render the index page."""
    return render_template('index.html')


@app.route('/logout')
def logout():
    """Clear the session and redirect to the index page."""
    session.clear()
    return redirect(url_for('index'))


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


@app.route('/logs_list')
@login_required
def logs_list():
    return render_template('logs.html')


@app.route('/lab1')
@login_required
def lab1():
    return redirect(url_for('lab1_summary'))


@app.route('/lab2')
@login_required
def lab2():
    return redirect(url_for('lab2_summary'))


@app.route('/lab3')
@login_required
def lab3():
    return redirect(url_for('lab3_summary'))


@app.route('/aetas')
@login_required
def aetas():
    return redirect(url_for('aetas_summary'))


# Team routes (unprotected)
@app.route('/team/kaylee.html')
def kaylee():
    return render_template('kaylee.html')


@app.route('/team/luke.html')
def luke():
    return render_template('luke.html')


@app.route('/team/elizabeth.html')
def elizabeth():
    return render_template('elizabeth.html')


@app.route('/team/gavin.html')
def gavin():
    return render_template('gavin.html')


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
