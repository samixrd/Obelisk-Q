import sqlite3
import os

db_path = "obelisk_memory.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM agent_memory ORDER BY id DESC LIMIT 5")
    rows = cursor.fetchall()
    for row in rows:
        print(row)
    conn.close()
else:
    print("DB not found")
