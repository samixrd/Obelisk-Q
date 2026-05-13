# Obelisk Q — Deployment & Integration Guide

Follow these steps to synchronize the AI engine, smart contracts, and frontend on Mantle Mainnet.

## 1. Start the AI Engine (Python Backend)
The AI Engine handles Q-Score, Market Regimes, and On-chain Rebalancing.

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python main.py

# To start a High Availability Shadow Node:
# NODE_ROLE=shadow NODE_ID=shadow-1 python main.py
```
*Ensure `.env` in `backend/` contains your `AGENT_PRIVATE_KEY` and `VAULT_ADDRESS`.*

## 2. Start the Frontend (Vite)
Ensure your `.env.local` has the correct `VITE_VAULT_ADDRESS` and `VITE_RPC_URL`.

```bash
# In the root directory
npm install
npm run dev
```

## 3. Deployment Configuration (Mantle Mainnet)
The project is optimized for Mantle Mainnet (Chain ID: 5000).

*   **Current Vault**: `0x54Dc21FA9Aa55ad53e23b80609b8bB1ea234Bca7`
*   **Merchant Moe Router**: `0xeaEE7EE68874218c3558b40063c42B82D3E7232a`
*   **Asset Registry**: The vault uses a dynamic registry. To add new assets (e.g. FBTC), the owner must call `addAsset(address)`.

### Agent Authorization & Protection
The agent is authorized to `rebalance` and `togglePause` the vault. To authorize a new agent:
```bash
cd contracts
npx hardhat run scripts/setAgent.js --network mantle
```

## 4. Verification & Telemetry
*   **Vault Stats**: Fetch live on-chain data (MNT/mETH/USDY balances).
*   **Agent Logs**: Real-time decision transparency via the FastAPI websocket.
*   **Rebalance Cooldown**: Configured to 300 seconds (5 minutes) by default in `main.py`.

---
**Warning**: Never commit your `.env` files. The `INTEGRATION_GUIDE.md` is for architecture reference.
