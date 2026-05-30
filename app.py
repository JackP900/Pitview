from flask import Flask
from routes.dashboard import dashboard
from database.models import init_db

app = Flask(__name__)

init_db()

app.register_blueprint(dashboard)

if __name__ == "__main__":
    app.run(debug=True, threaded=True)