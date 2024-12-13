from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from functools import wraps
import os
import secrets
from datetime import timedelta
from datetime import datetime
from urllib.parse import urlparse
import logging


# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)

def read_password(file_path="password.txt"):
    """Reads the password from the password.txt file."""
    with open(file_path, 'r') as f:
        return f.read().strip()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            # Remember where the user was trying to go
            return redirect(url_for('login', next=request.url))
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

@app.route('/check-auth', methods=['POST'])
def check_auth():
    """Endpoint to check if user is authenticated"""
    is_auth = 'authenticated' in session
    logger.debug(f"Auth check: {is_auth}")
    return jsonify({"authenticated": is_auth})

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        password = request.form.get('password')
        if password == read_password():
            session['logged_in'] = True
            next_page = request.args.get('next')
            if next_page:
                # Get just the path part if it's a full URL
                path = next_page.split('/', 3)[-1] if next_page.startswith('http') else next_page
                return redirect('/' + path)
            return redirect(url_for('index'))
        return 'Invalid password'
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

# Protected routes
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
    logger.debug("Redirecting from /lab1 to lab1_summary")
    return redirect(url_for('lab1_summary'))

@app.route('/lab2')
@login_required
def lab2():
    logger.debug("Redirecting from /lab2 to lab2_summary")
    return redirect(url_for('lab2_summary'))

@app.route('/lab3')
@login_required
def lab3():
    logger.debug("Redirecting from /lab3 to lab3_summary")
    return redirect(url_for('lab3_summary'))

@app.route('/aetas')
@login_required
def aetas():
    logger.debug("Redirecting from /aetas to aetas_summary")
    return redirect(url_for('aetas_summary'))



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
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))