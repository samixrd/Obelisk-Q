# 🛠️ Local Development Setup

## Prerequisites
- Node.js 18+
- Python 3.10+
- pnpm (install: `npm install -g pnpm`)
- Git

## Quick Start (5 Minutes)

### 1. Clone Repository
```bash
git clone https://github.com/samixrd/Obelisk-Q.git
cd Obelisk-Q
```

### 2. Install All Dependencies
```bash
pnpm install
pnpm run install:backend
```

### 3. Setup Environment Variables
Create `.env.local` in root:

```env
VITE_PRIVY_APP_ID=<your_privy_id>
VITE_MANTLE_RPC_URL=https://rpc.mantle.xyz
VITE_OBELISK_VAULT_ADDRESS=0x59fdE89B810812846ED167033C6d33fa425835E2
```

Create `backend/.env`:

```env
MANTLE_RPC_URL=https://rpc.mantle.xyz
OPENAI_API_KEY=<your_key>
DATABASE_URL=sqlite:///./test.db
ODOS_API_KEY=<your_odos_api_key>  # Required! Get free at https://odos.xyz
```

### 4. Start Everything
```bash
pnpm run dev:all
```

This runs:
- Frontend on http://<your-localhost-or-azure-ip>:5173
- Backend on http://<your-localhost-or-azure-ip>:8000

### 5. Open Swagger Docs
http://<your-localhost-or-azure-ip>:8000/docs — test API endpoints here

### Troubleshooting
| Issue | Solution |
|---|---|
| pnpm not found | Run `npm install -g pnpm` |
| Python modules missing | Run `pip install -r backend/requirements.txt` |
| Port 8000 in use | Kill process or use `export PORT=8001` |
| Mantle RPC timeout | Switch to backup: `https://rpc.mantle.xyz/http` |

### Next Steps
- Read [ALGORITHM.md](./ALGORITHM.md) for regime detection deep dive
- Read [RWA_REPORT.md](./RWA_REPORT.md) for strategy explanation
- Check `contracts/` for smart contract code
