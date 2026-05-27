from flask import Flask
from routes.dashboard import dashboard

app = Flask(__name__)

@app.route("/")
def home():
    return "Pitview running"

app.register_blueprint(dashboard)

if __name__ == "__main__":
    app.run(debug=True, threaded=True)