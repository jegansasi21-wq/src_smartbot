from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

DATA_FILE = "college_data.json"


def load_college_data():
    if not os.path.exists(DATA_FILE):
        return []

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except (json.JSONDecodeError, OSError):
        return []


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Welcome to the SRC College Chatbot API!",
        "status": "running"
    })


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    question = data.get("question", "").strip().lower()

    if not question:
        return jsonify({
            "answer": "Please enter a question."
        }), 400

    college_data = load_college_data()

    for item in college_data:
        keywords = item.get("keywords", [])

        if any(
            keyword.lower() in question
            for keyword in keywords
        ):
            return jsonify({
                "answer": item.get(
                    "answer",
                    "Sorry, I don't have that information yet."
                )
            })

    return jsonify({
        "answer": (
            "Sorry, I don't have that information yet. "
            "Please ask about scholarships, faculty, sports, "
            "or previous question papers."
        )
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)