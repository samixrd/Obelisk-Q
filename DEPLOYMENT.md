# 🛡️ Obelisk Q: Judge Verification & Deployment Blueprint

This document serves as the official guide for Hackathon Judges evaluating the **Obelisk Q** autonomous wealth optimization system built on the **Mantle Network** (Chain ID `5000`). It provides step-by-step instructions to verify live mainnet operations, run quick verification checks, execute a full system deployment, audit environment configurations, monitor system health, and troubleshoot execution states.

---

## 1. Quick Verification (5 Minutes)

Judges can instantly verify the live mainnet state of Obelisk Q and its autonomous agent operations using public endpoints and block explorers, requiring zero local setup.

### 1.1 Live Contract Auditing on Mantle Explorer
The Obelisk Q Vault and its associated contracts are live on the Mantle Mainnet. You can verify on-chain balances, transaction histories, and ownership structures directly:

| Contract | Purpose | Address | Link |
|---|---|---|---|
| **ObeliskVault** | Core Capital Vault & Swap Execution Engine | `0x59fdE89B810812846ED167033C6d33fa425835E2` | [Mantle Explorer](https://explorer.mantle.xyz/address/0x59fdE89B810812846ED167033C6d33fa425835E2) |
| **ZKRegimeVerifier** | Validates Zero-Knowledge Regime Proofs On-Chain | `0xbd47209Fc1B99B9100c22ABF2C27CaD218dC974D` | [Mantle Explorer](https://explorer.mantle.xyz/address/0xbd47209Fc1B99B9100c22ABF2C27CaD218dC974D) |
| **mETH (Mantle LSP)** | Growth/Expansion Asset (Liquid Staking) | `0xcDA86A272531e8640cD7F1a92c01839911B90bb0` | [Mantle Explorer](https://explorer.mantle.xyz/address/0xcDA86A272531e8640cD7F1a92c01839911B90bb0) |
| **USDY (Ondo RWA)** | Defensive/Contraction Asset (US Treasuries) | `0x5bE26527e817998A7206475496fDE1e68957c5A6` | [Mantle Explorer](https://explorer.mantle.xyz/address/0x5bE26527e817998A7206475496fDE1e68957c5A6) |
| **WMNT (Wrapped MNT)**| Neutral/Consolidation Asset | `0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8` | [Mantle Explorer](https://explorer.mantle.xyz/address/0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8) |

### 1.2 Five-Minute Telemetry Verification (Local or Live)
Execute the following quick-check commands to fetch structured live-metrics, volatility calculations, and on-chain transparency records from the agent's running instance (assuming `http://localhost:8000` for a local backend, or pointing to the live production server at `https://api.obeliskq.app`):

```bash
# 1. Fetch live metrics (AUM, dynamic portfolio breakdown %, PnL, rebalances)
curl -s http://localhost:8000/api/vault/live-metrics | jq

# 2. Fetch realized volatility analysis (std dev, cycles count, risk mitigation context)
curl -s http://localhost:8000/api/analytics/volatility-analysis | jq

# 3. Retrieve supported assets (queries vault's allowedAssets dynamic array & maps yields)
curl -s http://localhost:8000/api/vault/supported-assets | jq

# 4. Fetch the agent's full on-chain identity manifest (ERC-8004 Metadata)
curl -s http://localhost:8000/api/agent/identity | jq
```

---

## 2. Full Deployment Guide (30 Minutes)

Follow this end-to-end walkthrough to deploy the entire Obelisk Q suite (Smart Contracts, LangGraph Agent Backend, and React/Vite Frontend) in your own environment.

### 2.1 Smart Contract Compilation & Deployment
The contracts utilize Hardhat for compilation and deployment to the Mantle Network.

1. **Navigate to the Contracts directory and install dependencies**:
   ```bash
   cd contracts
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `contracts/.env` file:
   ```env
   MANTLE_RPC_URL=https://rpc.mantle.xyz
   DEPLOYER_PRIVATE_KEY=0x... # Your private key containing MNT for gas
   ```

3. **Compile the Contracts**:
   ```bash
   npx hardhat compile
   ```

4. **Deploy to Mantle Mainnet**:
   ```bash
   npx hardhat run scripts/deploy.js --network mantle
   ```
   *Note: Save the printed `ObeliskVault` and `ZKRegimeVerifier` addresses for the backend setup.*

---

### 2.2 LangGraph & FastAPI Backend Deployment
The backend acts as the autonomous intelligence, querying live data, calculating mathematical metrics, generating ZK regime proofs, and issuing contract commands.

1. **Install System-Level Prerequisites**:
   Ensure `Python 3.11+` and `SQLite` are installed. Optionally install `Redis` for multi-node High-Availability mode.

2. **Setup Virtual Environment & Install Dependencies**:
   ```bash
   cd backend
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   ```

3. **Initialize the SQLite Database**:
   The backend automatically sets up the required tables inside `obelisk_memory.db` on boot if it does not already exist.

4. **Run Backend Verification Tests**:
   Before starting the live engine, verify the codebase integrity:
   ```bash
   pytest test_api.py test_main.py -v
   ```

5. **Launch the Engine**:
   - **Single-Node Mode** (Simple, developer-friendly execution):
     ```bash
     python main.py
     ```
   - **Multi-Node Swarm Mode** (High-Availability Production via PM2):
     Ensure Redis is running locally (`redis-server`), then run:
     ```bash
     pm2 start ecosystem.config.js
     ```

---

### 2.3 React & Vite Frontend Deployment
The user interface provides an elegant dashboard, showcasing AUM, active user deposits, agent cycles, real-time portfolio allocations, and historical ZK-ML regime classification paths.

1. **Navigate to Root Directory and Install Packages**:
   ```bash
   cd ..
   pnpm install
   ```

2. **Configure Environment**:
   Create or modify `.env.local` in the project root folder. Fill out the necessary Privy App ID and contract addresses as outlined in the Environment Variables section below.

3. **Launch the Development Server**:
   ```bash
   pnpm run dev
   ```
   The application will be accessible at **`http://localhost:5173`**.

4. **Build Production Assets (Optional)**:
   ```bash
   pnpm run build
   ```

---

## 3. Environment Variables & Secret Configuration

To ensure maximum security, the backend separates public parameters from cryptographic keys and AI secrets. 

> [!IMPORTANT]
> Never commit active private keys or AI API secrets to any public version control system.

### 3.1 Backend environment Config (`backend/.env`)

| Variable | Public/Secret | Required | Description |
|---|---|---|---|
| `AGENT_PRIVATE_KEY` | 🔒 Secret | Yes | The private key of the autonomous agent wallet that calls on-chain rebalances and signs state proofs. |
| `AZURE_OPENAI_API_KEY` | 🔒 Secret | Yes | Azure OpenAI API key used to query the GPT-4o-mini cognitive sentiment layer. |
| `AZURE_OPENAI_ENDPOINT` | 🔒 Secret | Yes | Base URL endpoint for the Azure OpenAI deployment instance. |
| `AZURE_OPENAI_DEPLOYMENT` | 🌐 Public | Yes | The target deployment name (e.g. `gpt-4o-mini`). |
| `MANTLE_RPC_URL` | 🌐 Public | Yes | The primary RPC url used to query balances (defaults to `https://rpc.mantle.xyz`). |
| `MANTLE_FALLBACK_RPC_URL`| 🌐 Public | Yes | Backup RPC endpoint used for transparent, zero-downtime failover rotation. |
| `VAULT_ADDRESS` | 🌐 Public | Yes | Contract address of the deployed `ObeliskVault` (`0x59fdE89B8108...`). |
| `DB_PATH` | 🌐 Public | Yes | The path of the local storage SQLite file (defaults to `obelisk_memory.db`). |
| `REDIS_URL` | 🔒 Secret | No | Redis connection URI required only for cluster leader-elections and state sharing. |
| `ODOS_API_KEY` | 🔒 Secret | Yes | API key for the Odos V3 DEX Aggregator used for all rebalance swaps. Register free at [odos.xyz](https://odos.xyz). Without this, swaps will fail with HTTP 429 rate limit errors. |

### 3.2 Frontend Environment Config (`.env.local`)

| Variable | Public/Secret | Required | Description |
|---|---|---|---|
| `VITE_PRIVY_APP_ID` | 🌐 Public | Yes | Your unique Privy Client ID to handle social logins, non-custodial user wallet embedding, and secure signatures. |
| `VITE_VAULT_ADDRESS` | 🌐 Public | Yes | The target deployed `ObeliskVault` contract address. |
| `VITE_RPC_URL` | 🌐 Public | Yes | Mainnet RPC URL exposed to users' Web3 providers. |
| `VITE_CHAIN_ID` | 🌐 Public | Yes | Chain ID of the target network (`5000` for Mantle Mainnet, `50001` for Mantle Testnet). |
| `VITE_API_URL` | 🌐 Public | No | Base path of the FastAPI telemetry backend. Defaults to `http://localhost:8000`. |

---

## 4. Monitoring, Transparency & Endpoint Verification

Obelisk Q provides a multi-layered verification checklist to ensure that the system executes securely, transparently, and autonomously without human error.

### 4.1 Verification Commands for the 6 Core Endpoints

#### Endpoint 1: Real-Time Vault Metrics (`/api/vault/live-metrics`)
*   **Purpose**: Validates active user count, real-time AUM (sum of MNT + mETH + USDY + WMNT balances on-chain), portfolio breakdown allocations based on live CoinGecko valuations, and total successful rebalance counts.
*   **Verification Command**:
    ```bash
    curl -s http://localhost:8000/api/vault/live-metrics | jq
    ```

#### Endpoint 2: Volatility & Regime Risk Analysis (`/api/analytics/volatility-analysis`)
*   **Purpose**: Returns standard deviation, averages, maximums, minimums, and contraction count over the last 30 cycles, along with a qualitative risk-mitigation interpretation.
*   **Verification Command**:
    ```bash
    curl -s http://localhost:8000/api/analytics/volatility-analysis | jq
    ```

#### Endpoint 3: Supported Assets (`/api/vault/supported-assets`)
*   **Purpose**: Queries on-chain allowed assets from the vault contract, parsing their individual names, contract addresses, target APYs, structural backings, and scalability constraints.
*   **Verification Command**:
    ```bash
    curl -s http://localhost:8000/api/vault/supported-assets | jq
    ```

#### Endpoint 4: Regime Decisions History (`/api/transparency/regime-decisions`)
*   **Purpose**: Audits the exact inputs (volatility, Fear & Greed indices, price shifts) and output decisions of every single historical rebalance cycle.
*   **Verification Command**:
    ```bash
    curl -s http://localhost:8000/api/transparency/regime-decisions | jq
    ```

#### Endpoint 5: Benchmark Performance (`/api/transparency/benchmark`)
*   **Purpose**: Provides an active comparison of Obelisk Q's cumulative net return against static holding benchmarks (mETH Liquid Staking vs USDY Treasuries).
*   **Verification Command**:
    ```bash
    curl -s http://localhost:8000/api/transparency/benchmark | jq
    ```

#### Endpoint 6: Cryptographic ZK-ML Verification (`/api/transparency/zk-ml`)
*   **Purpose**: Displays the zero-knowledge validation state, proving that the HMM regime calculations were computed truthfully off-chain before contract execution.
*   **Verification Command**:
    ```bash
    curl -s http://localhost:8000/api/transparency/zk-ml | jq
    ```

---

### 4.2 Security & Operational Verification Checklist

To prove the operational readiness of the system:
1.  **Validate Active Agent execution**:
    Call `GET /api/agent/health` and verify `is_active` is `true`, and that the `completed_cycles_count` increment occurs sequentially every cycle.
2.  **Verify Multi-RPC Failover**:
    Simulate a network blackhole by temporarily pointing `MANTLE_RPC_URL` to an invalid address. Check the console/PM2 logs to confirm the `RPCManager` logs an exception and immediately routes queries to `MANTLE_FALLBACK_RPC_URL` with zero downtime.
3.  **Audit the SQLite WAL state safety**:
    Inspect the `backend` directory to ensure `obelisk_memory.db-wal` and `obelisk_memory.db-shm` are active. This verifies Write-Ahead Logging is protecting state history from crash corruption.
4.  **On-Chain Rebalance Audit**:
    Inspect `GET /api/agent/transactions`. Capture a returned transaction hash and verify on [Mantle Explorer](https://explorer.mantle.xyz) that the origin sender is indeed the authorized `Agent Address` and the target is the `ObeliskVault`'s `rebalance` selector.

---

## 5. Troubleshooting & Runbooks

Under extraordinary circumstances, operations teams can leverage these standard runbooks to recover system states.

### 5.1 Scenario A: Node Cycle Execution Failure
*   **Symptom**: The agent misses its execution heartbeat or fails to compute the current cycle.
*   **Diagnostics**:
    1. Check if the database execution lock has been orphaned:
       ```bash
       sqlite3 obelisk_memory.db "SELECT * FROM cycle_execution_lock;"
       ```
    2. Inspect logs for LangGraph routing exceptions:
       ```bash
       pm2 logs
       ```
*   **Resolution**: 
    If a crash orphaned the execution lock, clear the lock and force-trigger a manual heartbeat:
    ```bash
    sqlite3 obelisk_memory.db "DELETE FROM cycle_execution_lock;"
    # Restart the node process
    pm2 restart obelisk-q-agent
    ```

### 5.2 Scenario B: Extreme Volatility / Database 500 Failures
*   **Symptom**: The SQLite database encounters locking conflicts (e.g. `database is locked`) during high-frequency telemetry read-write bursts.
*   **Diagnostics**:
    Check if WAL mode is disabled.
*   **Resolution**:
    Manually force SQLite to upgrade its journal mode:
    ```bash
    sqlite3 obelisk_memory.db "PRAGMA journal_mode=WAL;"
    ```
    This separates read and write pipelines completely, allowing uninterrupted API telemetry queries even while the agent is executing heavy database writes.

### 5.3 Scenario C: Mainnet RPC Outages
*   **Symptom**: All configured RPCs return timeout errors.
*   **Diagnostics**:
    Check API responsiveness: `/api/vault/live-metrics` returns `rpc_status: degraded`.
*   **Resolution**:
    The system gracefully degrades, retaining the prior cycle's volatility and utilizing hard-coded fallback token prices ($0.68 for MNT, $3100.00 for mETH, $1.00 for USDY) to keep services fully operational. To recover fully:
    1. Obtain a fresh high-tier RPC endpoint from Ankr or PublicNode.
    2. Update the `MANTLE_RPC_URL` in `backend/.env`.
    3. Reload the process without downtime: `pm2 reload ecosystem.config.js`.

---
*Developed for the Mantle AI & RWA Hackathon 2025 — Dedicated to Open, Autonomously Secure, and Impact-Driven Wealth Management.*
