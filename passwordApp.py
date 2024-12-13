from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from functools import wraps
import os
import secrets
from datetime import timedelta
from datetime import datetime
from urllib.parse import urlparse


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

def clean_path(url):
    """Clean URL to get proper path"""
    if not url:
        return '/'
        
    if url.startswith('http'):
        # Parse URL and get path
        parsed = urlparse(url)
        path = parsed.path
    else:
        path = url
        
    # Remove any leading or trailing slashes
    path = path.strip('/')
    
    # Add single leading slash
    return f'/{path}' if path else '/'

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
        password = request.form.get('password')
        if password == read_password():
            session['logged_in'] = True
            next_page = request.args.get('next')
            if next_page:
                return redirect(clean_path(next_page))
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