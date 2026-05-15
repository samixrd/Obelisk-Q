import os
import json
import logging
from datetime import datetime
from typing import Optional

import redis
import sqlite3

logger = logging.getLogger("obelisk.heartbeat")

class HeartbeatManager:
    """Manage node heartbeat using Redis if configured, otherwise fallback to SQLite.

    This provides a simple HA‑compatible storage for the heartbeat table without
    requiring schema changes to the existing SQLite database used for other state.
    """
    def __init__(self, redis_url: Optional[str] = None, db_path: str = "obelisk_memory.db"):
        self.redis_url = redis_url or os.getenv("REDIS_URL")
        self.db_path = db_path
        if self.redis_url:
            try:
                self.redis_client = redis.from_url(self.redis_url)
                # Test connection
                self.redis_client.ping()
                logger.info("heartbeat: using Redis backend for heartbeats")
            except Exception as e:
                logger.warning(f"heartbeat: Redis unavailable ({e}); falling back to SQLite")
                self.redis_client = None
        else:
            self.redis_client = None
            logger.info("heartbeat: no REDIS_URL, using SQLite backend")

    def _sqlite_conn(self):
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.execute("PRAGMA journal_mode=WAL")
        return conn

    def update(self, node_id: str, role: str, rpc_status: str = "OK") -> None:
        """Write a heartbeat entry.

        Parameters
        ----------
        node_id: unique identifier for the node (e.g., "local-1")
        role: "primary" or "shadow"
        rpc_status: health of the RPC connection (default "OK")
        """
        timestamp = datetime.utcnow().isoformat()
        if self.redis_client:
            key = f"heartbeat:{node_id}"
            payload = json.dumps({"role": role, "status": rpc_status, "timestamp": timestamp})
            try:
                self.redis_client.set(key, payload, ex=120)  # expire after 2 minutes
                logger.debug(f"heartbeat: redis updated for {node_id}")
                return
            except Exception as e:
                logger.warning(f"heartbeat: redis write failed ({e}); falling back to SQLite")
        # SQLite fallback
        try:
            conn = self._sqlite_conn()
            conn.execute(
                "INSERT OR REPLACE INTO heartbeats (node_id, last_pulse, role, status) VALUES (?, ?, ?, ?)",
                (node_id, timestamp, role, rpc_status)
            )
            conn.commit()
            conn.close()
            logger.debug(f"heartbeat: sqlite updated for {node_id}")
        except Exception as e:
            logger.error(f"heartbeat: sqlite update failed: {e}")

    def primary_is_healthy(self) -> bool:
        """Return True if a primary node reported a recent "OK" heartbeat.
        """
        # Prefer Redis if available because it can query all keys efficiently.
        if self.redis_client:
            try:
                keys = self.redis_client.keys("heartbeat:*")
                now = datetime.utcnow()
                for key in keys:
                    data = json.loads(self.redis_client.get(key) or "{}")
                    if data.get("role") == "primary" and data.get("status") == "OK":
                        ts = datetime.fromisoformat(data.get("timestamp", now.isoformat()))
                        if (now - ts).total_seconds() < 60:
                            return True
                return False
            except Exception as e:
                logger.warning(f"heartbeat: redis health check failed ({e}), falling back to SQLite")
        # SQLite fallback – same logic as original implementation
        try:
            conn = self._sqlite_conn()
            row = conn.execute(
                "SELECT last_pulse, status FROM heartbeats WHERE role = 'primary' ORDER BY last_pulse DESC LIMIT 1"
            ).fetchone()
            conn.close()
            if row:
                last_pulse = datetime.fromisoformat(row[0])
                status = row[1]
                diff = (datetime.utcnow() - last_pulse).total_seconds()
                return diff < 60 and status == "OK"
            return False
        except Exception as e:
            logger.error(f"heartbeat: sqlite health check failed: {e}")
            return False
