from flask import Flask, request, url_for, redirect, session
from routes.dashboard import dashboard
from routes.session import session as session_blueprint
from routes.auth import auth
from routes.settings import settings
from database.models import init_db
import config
import os

# Open-demo mode: when set, the login wall is bypassed so the deployed
# demo loads straight to the dashboard.
DEMO_MODE = os.environ.get("DEMO_MODE", "").lower() in ("1", "true", "yes")

app = Flask(__name__)

init_db()

app.register_blueprint(dashboard)
app.register_blueprint(session_blueprint)
app.register_blueprint(auth)
app.register_blueprint(settings)

app.secret_key = config.SECRET_KEY


@app.context_processor
def inject_demo():
    return {"demo_mode": DEMO_MODE}

@app.before_request
def check_login():
    if DEMO_MODE:
        return
    allowed = ["auth.login"]
    if request.endpoint not in allowed and not session.get("logged_in"):
        return redirect(url_for("auth.login"))

if __name__ == "__main__":
    app.run(debug=True, threaded=True)