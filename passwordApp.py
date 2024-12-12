from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from functools import wraps
import os
import secrets
from datetime import timedelta
import time

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)
app.config['SESSION_PERMANENT'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)

# Store tab-specific sessions
tab_sessions = {}

def cleanup_old_sessions():
    """Clean up expired tab sessions"""
    current_time = time.time()
    expired_tabs = [tab for tab, data in tab_sessions.items() 
                   if current_time - data['timestamp'] > 3600]
    for tab in expired_tabs:
        del tab_sessions[tab]

def read_password(file_path="password.txt"):
    """Reads the password from the password.txt file."""
    with open(file_path, 'r') as f:
        return f.read().strip()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        cleanup_old_sessions()
        
        if 'authenticated' in session:
            return f(*args, **kwargs)
        
        # For AJAX requests
        if request.is_json:
            return jsonify({"success": False, "redirect_url": url_for('login')}), 401
            
        # For regular requests
        return redirect(url_for('login', next=request.url))
    
    return decorated_function

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user_password = request.json.get('password')
        actual_password = read_password()
        
        if user_password == actual_password:
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

# Protected routes - combine GET and POST methods
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