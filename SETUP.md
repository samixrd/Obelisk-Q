# 🪐 Obelisk Q — Local Setup Guide

> **For Judges**: The system is already live at [obeliskq.app](https://obeliskq.app). This guide is for running a local instance to inspect the codebase end-to-end.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Python | 3.11+ | `python --version` |
| Node.js | 18+ | `node --version` |
| Redis | 7+ | `redis-server --version` (optional for single-node) |
| Git | Any | `git --version` |

---

## Quick Start (5 Minutes)

### Step 1 — Clone & Configure

```bash
git clone https://github.com/samixrd/Obelisk-Q.git
cd Obelisk-Q

# Configure backend environment
cp backend/.env.example backend/.env
# Edit backend/.env — fill in AZURE_OPENAI_API_KEY and AGENT_PRIVATE_KEY

# Configure frontend environment
cp .env.example .env.local   # or create .env.local manually
# Edit .env.local — set VITE_PRIVY_APP_ID (get from https://dashboard.privy.io)
```

### Step 2 — Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 3 — Start the Backend (Agent + API)

```bash
# Single-node mode (no Redis needed):
cd backend
python main.py
```

The backend starts on **`http://localhost:8000`**. The autonomous agent begins its first cycle within 10 seconds.

**Verify it's running:**
```bash
curl http://localhost:8000/api/agent/health
curl http://localhost:8000/api/stats
```

### Step 4 — Install & Start Frontend

```bash
# In a new terminal:
cd obelisk-q-wealth-navigator-main  # repo root
pnpm install
pnpm run dev
```

Frontend starts on **`http://localhost:5173`**

---

## Multi-Node HA Mode (Production)

Requires Redis. Uses PM2 for process management:

```bash
# Install Redis (Ubuntu/WSL):
sudo apt install redis-server && sudo service redis-server start

# Install PM2 globally:
npm install -g pm2

# Start 3-node swarm:
pm2 start ecosystem.config.js

# Monitor all nodes:
pm2 logs
pm2 monit
```

---

## Judge-Readable API Endpoints

All endpoints are **public** (no authentication required):

| Endpoint | Description |
|---|---|
| `GET /api/agent/health` | Live cycle count, uptime, rebalance count |
| `GET /api/agent/identity` | ERC-8004 Agent Identity Manifest |
| `GET /api/stats` | AUM, active users, live vault balance (on-chain) |
| `GET /api/cycles/history` | Full audit trail — every cycle with regime + score |
| `GET /api/agent/transactions` | On-chain tx hashes (verify on Mantle Explorer) |
| `GET /api/agent/logs` | Last 20 agent memory entries |
| `GET /api/performance` | Historical P&L log |
| `GET /metrics` | Prometheus metrics (Q-Score gauge, rebalance counter) |
| `WS /ws` | Real-time WebSocket telemetry feed |

---

## Verifying On-Chain

| Contract | Address | Link |
|---|---|---|
| ObeliskVault | `0xE7F15F0FBaF7f928AC42D7352BBF68E9Ab94c6DD` | [Mantle Explorer](https://explorer.mantle.xyz/address/0xE7F15F0FBaF7f928AC42D7352BBF68E9Ab94c6DD) |
| ZKRegimeVerifier | `0x2319ae743dF01506eAd1Fbc9398780885cCeF60d` | [Mantle Explorer](https://explorer.mantle.xyz/address/0x2319ae743dF01506eAd1Fbc9398780885cCeF60d) |
| USDY (Ondo) | `0x5bE26527e817998A7206475496fDE1e68957c5A6` | [Mantle Explorer](https://explorer.mantle.xyz/address/0x5bE26527e817998A7206475496fDE1e68957c5A6) |
| mETH | `0xcDA86A272531e8640cD7F1a92c01839911B90bb0` | [Mantle Explorer](https://explorer.mantle.xyz/address/0xcDA86A272531e8640cD7F1a92c01839911B90bb0) |

---

## Running Tests

```bash
# Backend tests:
cd backend
pytest test_api.py test_main.py -v

# Frontend unit tests:
pnpm run test
```

---

## Environment Variables Reference

See `backend/.env.example` for the full annotated template.

| Variable | Required | Description |
|---|---|---|
| `AZURE_OPENAI_API_KEY` | ✅ Yes | LLM provider key (Azure OpenAI) |
| `AGENT_PRIVATE_KEY` | ✅ Yes | Agent wallet private key (dedicated wallet only) |
| `VAULT_ADDRESS` | ✅ Yes | ObeliskVault contract address |
| `MANTLE_RPC_URL` | ✅ Yes | Mantle RPC endpoint |
| `COINGECKO_API_KEY` | ⚠️ Optional | Improves MNT price data reliability |
| `REDIS_URL` | ⚠️ Optional | Required for multi-node HA mode only |

**Frontend** (`.env.local` in project root):

| Variable | Required | Description |
|---|---|---|
| `VITE_PRIVY_APP_ID` | ✅ Yes | Privy App ID for wallet connection (get from [dashboard.privy.io](https://dashboard.privy.io)) |
| `VITE_VAULT_ADDRESS` | ✅ Yes | ObeliskVault contract address |
| `VITE_RPC_URL` | ✅ Yes | Mantle RPC endpoint |
| `VITE_CHAIN_ID` | ✅ Yes | Chain ID (`5000` for Mantle mainnet) |
| `VITE_API_URL` | ⚠️ Optional | Backend API URL (defaults to same origin) |
| `VITE_WS_URL` | ⚠️ Optional | WebSocket URL (defaults to same origin) |

---

## Architecture Overview

```
Frontend (React/Vite) ──── WebSocket ────► Backend (FastAPI)
                                                    │
                    ┌───────────────────────────────┤
                    │                               │
              LangGraph Pipeline              SQLite + Redis
          (7-node agent swarm)            (state + HA heartbeat)
                    │
              Mantle Mainnet
         (ObeliskVault Contract)
```

See [ALGORITHM.md](./ALGORITHM.md) for full algorithmic documentation.

---

*Built for the Mantle AI & RWA Hackathon 2025 — [samixrd/Obelisk-Q](https://github.com/samixrd/Obelisk-Q)*
