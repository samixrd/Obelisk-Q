#!/bin/bash

# Obelisk Q VM Production Setup
echo "═══════════════════════════════════════════════"
echo "  Obelisk Q — Azure VM Infrastructure Setup"
echo "═══════════════════════════════════════════════"

# 1. Update & Install System Dependencies
sudo apt-get update
sudo apt-get install -y python3-pip python3-venv nodejs npm git nginx curl


# 3. Setup Python Virtual Environment
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

# 4. Create Log Directories
mkdir -p backend/logs
chmod 755 backend/logs

# 5. Configure Firewall (Azure)
sudo ufw allow 8000/tcp # Backend API
sudo ufw allow 80/tcp   # Nginx
echo "Firewall updated. Ensure Port 8000 is also open in Azure Portal Networking tab."

# 6. Final Status
echo "\n✅ Infrastructure Ready!"
echo "To start the agent swarm, run: pm2 start ecosystem.config.js"
echo "To view logs, run: pm2 logs"
echo "═══════════════════════════════════════════════"
