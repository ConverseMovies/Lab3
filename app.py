from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

def read_password(file_path="password.txt"):
    with open(file_path, 'r') as f:
        return f.read().strip()

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/validate', methods=['POST'])
def validate():
    user_password = request.json.get('password')  # Use JSON data
    actual_password = read_password()

    if user_password == actual_password:
        return jsonify({"success": True, "redirect_url": "/protected"})
    else:
        return jsonify({"success": False, "message": "Incorrect password."})

@app.route('/protected')
def protected():
    return render_template("page1.html")

if __name__ == '__main__':
    app.run(debug=True)
