from flask import Flask, request, url_for, redirect, session
from routes.dashboard import dashboard
from routes.session import session as session_blueprint
from routes.auth import auth
from database.models import init_db
import config

app = Flask(__name__)

init_db()

app.register_blueprint(dashboard)
app.register_blueprint(session_blueprint)
app.register_blueprint(auth)

app.secret_key = config.SECRET_KEY

@app.before_request
def check_login():
    allowed = ["auth.login"]
    if request.endpoint not in allowed and not session.get("logged_in"):
        return redirect(url_for("auth.login"))

if __name__ == "__main__":
    app.run(debug=True, threaded=True)