# 🧪 Obelisk Q: Testing Infrastructure

This project implements a multi-layer testing strategy to ensure the reliability of the autonomous financial engine across Smart Contracts, AI Backend, and Frontend.

## 📁 Test Directory Structure

```text
obelisk-q-wealth-navigator/
├── backend/
│   ├── test_api.py        # FastAPI Endpoint & Auth Tests
│   └── test_nodes.py      # LangGraph Logic & Math Node Tests
├── contracts/
│   └── test/
│       └── Vault.test.js  # ObeliskVault Unit Tests (Hardhat)
└── src/
    └── components/
        └── obelisk/
            └── Logo.test.tsx # Frontend Component Tests (Vitest)
```

## 🛠️ Running the Tests

### 1. Smart Contracts (Hardhat)
```bash
cd contracts
npx hardhat test
```

### 2. Backend Engine (Pytest)
```bash
cd backend
source venv/bin/activate
pytest test_api.py test_nodes.py
```

### 3. Frontend UI (Vitest)
```bash
npm run test
```

## 📊 Coverage Highlights

- **Security**: SIWE Signature verification and session expiration tests.
- **Financial Integrity**: Vault gas buffer preservation and authorized asset management.
- **Autonomous Logic**: Regime detection fallbacks and circuit breaker triggering.
- **Failover**: Multi-RPC rotation and SQLite self-healing database tests.

## 🔗 Monitoring & Docs
- **API Documentation**: [http://<your-localhost-or-azure-ip>:8000/docs](http://<your-localhost-or-azure-ip>:8000/docs) (Swagger UI)
- **Prometheus Metrics**: [http://<your-localhost-or-azure-ip>:8000/metrics](http://<your-localhost-or-azure-ip>:8000/metrics)
