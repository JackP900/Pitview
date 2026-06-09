from flask import Blueprint, render_template, request, redirect, url_for
import json

settings = Blueprint("settings", __name__)

@settings.route("/showsettings", methods=["GET"])
def showsettings():
    with open("settings.json") as f:
        data = json.load(f)

    return render_template("settings.html", data=data)

@settings.route("/save", methods=["POST"])
def save():
    
    data = {
        "port": request.form["port"],
        "baud": request.form["baud"]
    }

    with open("settings.json", "w") as f:
        json.dump(data, f)

    return redirect(url_for("settings.showsettings"))


