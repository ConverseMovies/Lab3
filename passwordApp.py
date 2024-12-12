from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from functools import wraps
import os
import secrets
from datetime import timedelta

app = Flask(__name__)
# Generate a secure random secret key for sessions
app.secret_key = secrets.token_hex(32)

# Production-ready session configuration
app.config.update(
    SESSION_COOKIE_SECURE=True,  # For HTTPS
    SESSION_COOKIE_HTTPONLY=True,  # Prevent JavaScript access to session cookie
    SESSION_COOKIE_SAMESITE='Lax',  # Prevent CSRF
    SESSION_PERMANENT=False,  # Session expires when browser closes
    PERMANENT_SESSION_LIFETIME=timedelta(days=1),  # Backup timeout
    SESSION_COOKIE_NAME='AerisSession'  # Custom cookie name
)

# Check if running in development environment
if app.debug or 'DEVELOPMENT' in os.environ:
    # Override secure cookie setting for local development
    app.config['SESSION_COOKIE_SECURE'] = False

def read_password(file_path="password.txt"):
    """Reads the password from the password.txt file."""
    with open(file_path, 'r') as f:
        return f.read().strip()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'authenticated' not in session:
            # Return JSON response for AJAX requests
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({"success": False, "redirect_url": url_for('login')}), 401
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/check-auth', methods=['POST'])
def check_auth():
    """Endpoint to check if user is authenticated"""
    return jsonify({"authenticated": 'authenticated' in session})

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user_password = request.json.get('password')
        actual_password = read_password()
        
        if user_password == actual_password:
            session.permanent = False  # Make session expire on browser close
            session['authenticated'] = True
            next_page = request.args.get('next') or request.json.get('next')
            return jsonify({
                "success": True,
                "redirect_url": next_page if next_page else "/"
            })
        
        return jsonify({"success": False, "message": "Incorrect password."})
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

# Protected routes
@app.route('/lab1', methods=['GET', 'POST'])
@login_required
def lab1():
    if request.method == 'POST':
        return jsonify({"success": True, "redirect_url": url_for('lab1_summary')})
    return redirect(url_for('lab1_summary'))

@app.route('/lab1_summary')
@login_required
def lab1_summary():
    return render_template('lab1.html')

@app.route('/lab2', methods=['GET', 'POST'])
@login_required
def lab2():
    if request.method == 'POST':
        return jsonify({"success": True, "redirect_url": url_for('lab2_summary')})
    return redirect(url_for('lab2_summary'))

@app.route('/lab2_summary')
@login_required
def lab2_summary():
    return render_template('lab2.html')

@app.route('/lab3', methods=['GET', 'POST'])
@login_required
def lab3():
    if request.method == 'POST':
        return jsonify({"success": True, "redirect_url": url_for('lab3_summary')})
    return redirect(url_for('lab3_summary'))

@app.route('/lab3_summary')
@login_required
def lab3_summary():
    return render_template('lab3.html')

@app.route('/aetas', methods=['GET', 'POST'])
@login_required
def aetas():
    if request.method == 'POST':
        return jsonify({"success": True, "redirect_url": url_for('aetas_summary')})
    return redirect(url_for('aetas_summary'))

@app.route('/aetas_summary')
@login_required
def aetas_summary():
    return render_template('calendar.html')

@app.route('/logs', methods=['GET', 'POST'])
@login_required
def logs():
    if request.method == 'POST':
        return jsonify({"success": True, "redirect_url": url_for('logs_list')})
    return redirect(url_for('logs_list'))

@app.route('/logs_list')
@login_required
def logs_list():
    return render_template('logs.html')

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