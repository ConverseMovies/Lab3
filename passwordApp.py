from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from functools import wraps
import os
import secrets
from datetime import timedelta
from datetime import datetime
from urllib.parse import urlparse


app = Flask(__name__)
app.config.update(
    PERMANENT_SESSION_LIFETIME=timedelta(days=1),
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_TYPE='filesystem',  # Add this
    SESSION_COOKIE_NAME='aeris_session',  # Custom session cookie name
    SESSION_REFRESH_EACH_REQUEST=True  # Important: refreshes session on each request
)
app.secret_key = secrets.token_hex(32)

@app.route('/check-auth', methods=['POST'])
def check_auth():
    is_authenticated = 'authenticated' in session
    # Refresh session if authenticated
    if is_authenticated:
        session.modified = True
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
            return redirect(url_for('login', next=request.path))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/submit-message', methods=['POST'])
def submit_message():
    # Get the message from the form
    message = request.form.get('message', '').strip()
    
    if message:
        # Create a unique filename based on the timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"message_{timestamp}.html"
        filepath = os.path.join(MESSAGE_DIR, filename)
        
        # Save the message as an HTML file
        with open(filepath, 'w') as file:
            file.write(f"<html><body><h1>Message</h1><p>{message}</p></body></html>")
        
        # Optionally send an email (example placeholder code)
        send_email("gavin-egger@uiowa.edu", "New Message Received", message)
        
    return redirect(url_for('logs'))

def send_email(to_email, subject, body):
    # Placeholder function for sending email
    # Use Flask-Mail, smtplib, or any email service here
    print(f"Sending email to {to_email}: {subject}\n{body}")

@app.route('/logs')
def logs():
    # Get all message files
    message_files = sorted(os.listdir(MESSAGE_DIR), reverse=True)
    return render_template('logs.html', message_files=message_files)

@app.route('/messages/<filename>')
def view_message(filename):
    filepath = os.path.join(MESSAGE_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r') as file:
            return file.read()
    return "Message not found", 404

@app.route('/')
def index():
    return render_template('index.html')

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
            session.modified = True
            
            next_url = request.json.get('next') or request.args.get('next') or '/'
            
            # Clean up the next_url
            if '://' in next_url:
                next_url = urlparse(next_url).path
            elif not next_url.startswith('/'):
                next_url = '/' + next_url
                
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
    # Force HTTPS
    if not request.is_secure and not request.headers.get('X-Forwarded-Proto', 'http') == 'https':
        if request.url.startswith('http://'):
            url = request.url.replace('http://', 'https://', 1)
            return redirect(url, code=301)
    
    # Extend session lifetime on each request if user is authenticated
    if 'authenticated' in session:
        session.permanent = True
        session.modified = True

@app.route('/logout')
def logout():
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