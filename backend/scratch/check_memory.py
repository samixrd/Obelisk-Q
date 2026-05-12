import sqlite3
import os

db_path = "obelisk_memory.db"
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, cycle, regime, score, action, position FROM agent_memory ORDER BY id DESC LIMIT 10;")
    rows = cursor.fetchall()
    print("Recent Agent Activity (Last 10 cycles):")
    print("-" * 80)
    print(f"{'Timestamp':<20} | {'Cycle':<6} | {'Regime':<15} | {'Score':<6} | {'Action':<10} | {'Position':<10}")
    print("-" * 80)
    for row in rows:
        print(f"{row[0]:<20} | {row[1]:<6} | {row[2]:<15} | {row[3]:<6} | {row[4]:<10} | {row[5]:<10}")
    conn.close()
