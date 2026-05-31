from flask import Blueprint, render_template, request, session, redirect, url_for
from werkzeug.security import check_password_hash
import config

auth = Blueprint("auth", __name__)

@auth.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")
    elif request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        if username == config.USERNAME and check_password_hash(config.PASSWORD_HASH, password):
            session["logged_in"] = True
            return redirect(url_for("dashboard.render"))
        else:
            return render_template("login.html", error="Invalid Credentials")



@auth.route("/logout", methods=["GET"])
def logout():
    session.clear()
    return redirect(url_for("auth.login"))