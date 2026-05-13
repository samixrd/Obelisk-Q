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
      name: "obelisk-shadow",
      script: "python3",
      args: "main.py",
      cwd: "./backend",
      env: {
        NODE_ROLE: "shadow",
        NODE_ID: "vm-shadow-1",
        PYTHONUNBUFFERED: "1"
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/shadow_error.log",
      out_file: "./logs/shadow_out.log",
      merge_logs: true,
      autorestart: true,
      restart_delay: 10000
    }
  ]
};
