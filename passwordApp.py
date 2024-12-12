import os
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

def read_password(file_path="password.txt"):
    """Reads the password from the password.txt file."""
    with open(file_path, 'r') as f:
        return f.read().strip()

@app.route('/')
def index():
    """Render the index.html page."""
    return render_template('index.html')

# LAB LINKS

@app.route('/lab1', methods=['POST'])
def lab1():
    """Handle the password validation for the Lab 1 summary page."""
    user_password = request.json.get('password')  # Password sent via JSON
    actual_password = read_password()

    if user_password == actual_password:
        return jsonify({"success": True, "redirect_url": "/lab1_summary"})
    else:
        return jsonify({"success": False, "message": "Incorrect password."})

@app.route('/lab1_summary')
def lab1_summary():
    """Render the Lab 1 summary page."""
    return render_template('lab1.html')

@app.route('/lab2', methods=['POST'])
def lab2():
    """Handle the password validation for the Lab 2 summary page."""
    user_password = request.json.get('password')  # Password sent via JSON
    actual_password = read_password()

    if user_password == actual_password:
        return jsonify({"success": True, "redirect_url": "/lab2_summary"})
    else:
        return jsonify({"success": False, "message": "Incorrect password."})

@app.route('/lab2_summary')
def lab2_summary():
    """Render the Lab 1 summary page."""
    return render_template('lab2.html')

@app.route('/lab3', methods=['POST'])
def lab3():
    """Handle the password validation for the Lab 3 summary page."""
    user_password = request.json.get('password')  # Password sent via JSON
    actual_password = read_password()

    if user_password == actual_password:
        return jsonify({"success": True, "redirect_url": "/lab3_summary"})
    else:
        return jsonify({"success": False, "message": "Incorrect password."})

@app.route('/lab3_summary')
def lab3_summary():
    """Render the Lab 3 summary page."""
    return render_template('lab3.html')

# AETAS link :p

@app.route('/aetas', methods=['POST'])
def aetas():
    """Handle the password validation for the aetas page."""
    user_password = request.json.get('password')  # Password sent via JSON
    actual_password = read_password()

    if user_password == actual_password:
        return jsonify({"success": True, "redirect_url": "/aetas_summary"})
    else:
        return jsonify({"success": False, "message": "Incorrect password."})

@app.route('/aetas_summary')
def aetas_summary():
    """Render the aetas summary page."""
    return render_template('calendar.html')

# LOG LINKS

@app.route('/logs', methods=['POST'])
def logs():
    """Handle the password validation for the logs page."""
    user_password = request.json.get('password')  # Password sent via JSON
    actual_password = read_password()

    if user_password == actual_password:
        return jsonify({"success": True, "redirect_url": "/logs_list"})
    else:
        return jsonify({"success": False, "message": "Incorrect password."})

@app.route('/logs_list')
def logs_list():
    """Render the log list page."""
    return render_template('logs.html')

# TEAM LINKS

@app.route('/team/kaylee.html')
def kaylee():
    """Render Kaylee's team member page."""
    return render_template('kaylee.html')

@app.route('/team/luke.html')
def luke():
    """Render Luke's team member page."""
    return render_template('luke.html')

@app.route('/team/elizabeth.html')
def elizabeth():
    """Render Elizabeth's team member page."""
    return render_template('elizabeth.html')

@app.route('/team/gavin.html')
def gavin():
    """Render Gavin's team member page."""
    return render_template('gavin.html')

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
