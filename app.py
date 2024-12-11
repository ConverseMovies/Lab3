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
    app.run(debug=True)
