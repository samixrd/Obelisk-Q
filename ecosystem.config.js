/**
 * Obelisk Q — PM2 Process Manager Configuration
 *
 * Defines the multi-node agent swarm for High Availability:
 *   - obelisk-primary:   Active executor. Runs the LangGraph pipeline and
 *                        signs on-chain transactions.
 *   - obelisk-shadow-1:  Hot standby #1. Monitors primary health via shared
 *                        SQLite heartbeats. Auto-promotes after 45s of primary
 *                        silence.
 *   - obelisk-shadow-2:  Hot standby #2. Tertiary failover. If both primary
 *                        AND shadow-1 fail, shadow-2 promotes itself.
 *
 * Architecture Notes:
 *   - All 3 processes share the same SQLite state (obelisk_memory.db).
 *   - Leader election is last-writer-wins (no Raft/Paxos).
 *   - Split-brain is mitigated by the vault's idempotent rebalance() and
 *     the 1800s cooldown between on-chain transactions.
 *   - PM2's autorestart handles individual process crashes.
 *   - For cross-VM HA, deploy shadow nodes on separate Azure VMs with
 *     a shared PostgreSQL or Redis heartbeat store instead of SQLite.
 */
module.exports = {
  apps: [
    {
      name: "obelisk-primary",
      script: "python3",
      args: "main.py",
      cwd: "./backend",
      env: {
        NODE_ROLE: "primary",
        NODE_ID: "vm-primary-1",
        PYTHONUNBUFFERED: "1"
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/primary_error.log",
      out_file: "./logs/primary_out.log",
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000
    },
    {
      name: "obelisk-shadow-1",
      script: "python3",
      args: "main.py",
      cwd: "./backend",
      env: {
        NODE_ROLE: "shadow",
        NODE_ID: "vm-shadow-1",
        PYTHONUNBUFFERED: "1"
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/shadow1_error.log",
      out_file: "./logs/shadow1_out.log",
      merge_logs: true,
      autorestart: true,
      restart_delay: 10000
    },
    {
      name: "obelisk-shadow-2",
      script: "python3",
      args: "main.py",
      cwd: "./backend",
      env: {
        NODE_ROLE: "shadow",
        NODE_ID: "vm-shadow-2",
        PYTHONUNBUFFERED: "1"
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/shadow2_error.log",
      out_file: "./logs/shadow2_out.log",
      merge_logs: true,
      autorestart: true,
      restart_delay: 15000
    }
  ]
};
