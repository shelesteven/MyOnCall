from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add the parent directory to path so we can import from database folder
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.user_functions import add_user, remove_user, add_preference, get_user
from database.schedule_functions import new_schedule, get_date
from database.database_testing import get_database

app = Flask(__name__)
# Enable CORS for your React frontend
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

@app.route("/")
def hello_world():
    return jsonify({"status": "API is running"})

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True, port=5000)

# User management routes
@app.route("/users", methods=["GET"])
def get_users():
    # Get all users from the database
    db = get_database()
    collection = db["users"]
    users = list(collection.find({}, {"_id": 0}))  # Exclude MongoDB _id
    return jsonify(users)

@app.route("/users", methods=["POST"])
def create_user():
    data = request.json
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")
    admin = data.get("admin", False)
    
    user = add_user(first_name, last_name, email, admin)
    return jsonify({"status": "success", "user": user})

@app.route("/users/<email>", methods=["DELETE"])
def delete_user(email):
    success = remove_user(email)
    if success:
        return jsonify({"status": "success", "message": f"User {email} deleted"})
    return jsonify({"status": "error", "message": "User not found"}), 404

@app.route("/users/preferences", methods=["POST"])
def add_user_preference():
    data = request.json
    email = data.get("email")
    date = data.get("date")
    priority = data.get("priority")
    
    success = add_preference(email, date, priority)
    if success:
        return jsonify({"status": "success"})
    return jsonify({"status": "error"}), 400

# Schedule management routes
@app.route("/schedules/<int:year>", methods=["POST"])
def create_schedule(year):
    success = new_schedule(year)
    if success:
        return jsonify({"status": "success", "message": f"Schedule for {year} created"})
    return jsonify({"status": "error"}), 400

@app.route("/schedules", methods=["GET"])
def get_schedules():
    db = get_database()
    collection = db["Schedule"]
    schedules = list(collection.find({}, {"_id": 0}))
    return jsonify(schedules)

// Example for your React app
const fetchUsers = async () => {
  try {
    const response = await fetch('http://localhost:5000/users');
    const data = await response.json();
    // Do something with the data
    console.log(data);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}