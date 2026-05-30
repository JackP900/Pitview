import sqlite3

def init_db():
    connection = sqlite3.connect("pitview.db")
    cursor = connection.cursor()

    cursor.execute("CREATE TABLE IF NOT EXISTS sessions (" \
    "id INTEGER PRIMARY KEY AUTOINCREMENT," \
    "created_at REAL" \
    ")")

    cursor.execute("CREATE TABLE IF NOT EXISTS readings (" \
    "id INTEGER PRIMARY KEY AUTOINCREMENT," \
    "session_id INTEGER," \
    "throttle REAL," \
    "brake REAL," \
    "steering REAL," \
    "timestamp REAL)")

    connection.commit()
    connection.close()


    
