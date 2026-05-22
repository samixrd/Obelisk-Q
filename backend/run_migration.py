import sqlite3
import os

def run_migration(db_path):
    print(f"Applying migration to {db_path}...")
    if not os.path.exists(os.path.dirname(db_path)) and os.path.dirname(db_path) != "":
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    with open("migration.sql", "r") as f:
        sql = f.read()
    conn.executescript(sql)
    conn.commit()
    conn.close()
    print("Migration applied successfully.")

if __name__ == "__main__":
    # Apply to backend database
    run_migration("obelisk_memory.db")
    
    # Apply to root database if exists
    root_db = os.path.join("..", "obelisk_memory.db")
    if os.path.exists(root_db):
        run_migration(root_db)
