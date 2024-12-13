from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from functools import wraps
import os
import secrets
from datetime import timedelta
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Generate a secure random secret key for sessions
app.secret_key = secrets.token_hex(32)

# Session configuration
app.config.update(
    SESSION_COOKIE_NAME='aeris_session',
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_COOKIE_HTTPONLY=True,
    PERMANENT_SESSION_LIFETIME=timedelta(hours=12)
)

def read_password(file_path="password.txt"):
    """Reads the password from the password.txt file."""
    with open(file_path, 'r') as f:
        return f.read().strip()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        logger.debug(f"Session contents: {session}")
        logger.debug(f"Checking auth for route: {request.path}")
        
        if 'authenticated' not in session:
            logger.debug("No authentication in session")
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({"authenticated": False}), 401
            return redirect(url_for('login', next=request.url))
            
        logger.debug("User is authenticated")
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/check-auth', methods=['POST'])
def check_auth():
    """Endpoint to check if user is authenticated"""
    is_auth = 'authenticated' in session
    logger.debug(f"Checking auth status: {is_auth}")
    logger.debug(f"Current session: {session}")
    return jsonify({"authenticated": is_auth})

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user_password = request.json.get('password')
        actual_password = read_password()
        
        if user_password == actual_password:
            # Clear any existing session data first
            session.clear()
            # Set session data
            session.permanent = True
            session['authenticated'] = True
            session.modified = True
            
            next_page = request.args.get('next') or request.json.get('next')
            logger.debug(f"Login successful, redirecting to: {next_page}")
            logger.debug(f"Session after login: {session}")
            
            return jsonify({
                "success": True,
                "redirect_url": next_page if next_page else "/"
            })
        
        logger.debug("Login failed - incorrect password")
        return jsonify({"success": False, "message": "Incorrect password."})
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

# Protected routes with direct access
@app.route('/lab1_summary')
@login_required
def lab1_summary():
    logger.debug("Accessing lab1_summary")
    return render_template('lab1.html')

@app.route('/lab2_summary')
@login_required
def lab2_summary():
    logger.debug("Accessing lab2_summary")
    return render_template('lab2.html')

@app.route('/lab3_summary')
@login_required
def lab3_summary():
    logger.debug("Accessing lab3_summary")
    return render_template('lab3.html')

@app.route('/aetas_summary')
@login_required
def aetas_summary():
    logger.debug("Accessing aetas_summary")
    return render_template('calendar.html')

@app.route('/logs_list')
@login_required
def logs_list():
    logger.debug("Accessing logs_list")
    return render_template('logs.html')

# Redirect routes
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

@app.route('/logs')
@login_required
def logs():
    return redirect(url_for('logs_list'))

@app.before_request
def before_request():
    """Log all requests for debugging"""
    logger.debug(f"Request to: {request.path}")
    logger.debug(f"Current session: {session}")

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
    
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'

    app.run(debug=debug, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))