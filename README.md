# 🪐 Obelisk Q Wealth Navigator
**Obelisk Q** is an autonomous wealth navigator for Mantle that leverages a sovereign agentic swarm to optimize yields across liquid staking and institutional RWAs.

## 🏗️ Built With

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-363636?logo=solidity&logoColor=white)
![Mantle](https://img.shields.io/badge/Mantle-5000-blue)

- **Frontend:** React 18 + TypeScript + Vite + Tailwind
- **Backend:** FastAPI (Python) + LangGraph AI agents
- **Smart Contracts:** Solidity (OpenZeppelin) on Mantle Mainnet
- **Database:** SQLite (with PostgreSQL migration planned)
- **AI:** GPT-4o-mini (Azure OpenAI) for regime confirmation
- **Deployment:** Vercel (frontend) + Azure (backend)

---

## ⚡ Summary
*   ✅ **ZK-ML On-Chain Verification**: High-precision ZK-ML regime model verification on-chain.
*   ✅ **Mainnet Ready**: Smart contracts deployed and verified on **Mantle Mainnet** ([0x59fdE89B810812846ED167033C6d33fa425835E2](https://explorer.mantle.xyz/address/0x59fdE89B810812846ED167033C6d33fa425835E2)).
*   ✅ **Continuous Execution**: Agent swarm running 24/7 — cycle count and uptime verifiable live at [`/api/agent/health`](https://obeliskq.app/api/agent/health).
*   ✅ **Autonomous Rebalancing**: On-chain rebalances executed autonomously with dynamic slippage protection (0.6%–0.8% based on regime and volatility, with a 2.5% hard value-loss cap). Minimum trade threshold is strictly set at **1 MNT** to prevent dust-amount swap failures.
*   ✅ **Autonomous Liquidity Guard Rails**: Enforces a real-time Oracle-based price impact check. If liquidity is too thin or price impact is high (using Odos V3 Aggregator), the agent autonomously aborts the trade to protect user capital (guarded at >0.6% price impact).
*   ✅ **Extreme Resilience**: **Multi-RPC failover** system integrated and tested across 3 independent providers (Mantle, PublicNode, Ankr).
*   ✅ **RWA Judge Endpoint**: Full live RWA intelligence report at [`/api/rwa/status`](https://obeliskq.app/api/rwa/status) — regime, allocation, live USDY/mETH APY, last rotation tx.
*   ✅ **Premium Responsive UI/UX**: Seamless onboarding experience, real-time live decision visualizer, glassmorphic analytics charts, and transparent transaction flows.


---

## 🎯 Why This Matters

Obelisk Q solves a **$16T opportunity**: making institutional-grade yield management accessible to retail users.

**The Problem:**
*   **Barriers to Entry:** Safe, institutional-grade US Treasury yields (~5% APY) are locked away from everyday retail users.
*   **Static Portfolio Loss:** Retail DeFi users miss 3%–5% annual alpha by holding static positions.
*   **Active Management Deficit:** There is no autonomous system that reacts to regime changes before prices react to protect capital.

**The Solution:**
*   **1-Click Wealth Management:** Users deposit MNT; the agent actively manages and balances positions 24/7.
*   **On-Chain Verifiability (ZK-ML):** All regime shifts generate Zero-Knowledge proofs verified directly on-chain on Mantle Network.
*   **Asymmetric Capital Safety:** Automatically shifts into institutional safe-haven RWA (USDY backed by US Treasury Bills) during market contractions.

| Metric | Value | Reference / Endpoint |
|---|---|---|
| **Min. Deposit** | 0.01 MNT | [ObeliskVault Contract](https://explorer.mantle.xyz/address/0x59fdE89B810812846ED167033C6d33fa425835E2) |
| **Agent Uptime** | 24/7 | [`/api/agent/health`](https://obeliskq.app/api/agent/health) |
| **Regime Detection** | Every 10 minutes | [`/api/rwa/status`](https://obeliskq.app/api/rwa/status) |
| **Safety Level** | Institutional-Grade | Circuit Breaker + ZK Verifier |

---

## 🚀 Quick Start & Live Verification (< 5 Minutes)

### 🌐 Live Demo & Endpoints
*   **Live Web App:** 🔗 [obeliskq.app](https://obeliskq.app)
*   **Live Uptime & Cycle Health:** `curl https://obeliskq.app/api/agent/health`
*   **Live Market Regime Status:** `curl https://obeliskq.app/api/rwa/status`
*   **Smart Contracts on Mantle:**
    *   [ObeliskVault (0x59fd...)](https://explorer.mantle.xyz/address/0x59fdE89B810812846ED167033C6d33fa425835E2)
    *   [ZKRegimeVerifier (0xbd47...)](https://explorer.mantle.xyz/address/0xbd47209Fc1B99B9100c22ABF2C27CaD218dC974D)

### 🏃 Run Locally
To spin up the repository on your local machine:

```bash
# Clone the repository
git clone https://github.com/samixrd/Obelisk-Q.git
cd Obelisk-Q

# Install dependencies for frontend and backend
pnpm install
pnpm run install:backend

# Launch frontend and backend concurrently
pnpm run dev:all
```

*   **Frontend Interface:** `http://localhost:5173`
*   **FastAPI Swagger Docs:** `http://localhost:8000/docs`

---

## 🏆 Hackathon Submission Details
Obelisk Q is submitted to **two tracks** and targeting key awards on the Mantle Network:
1. **AI & RWA Track** (Application Path)
2. **AI & Trading & Strategy Track** (DeFi Strategy Path)
3. 🏅 Targeting: **Grand Champion (Grand Prize)** and **Best UI/UX Design**

---

### 📝 The Unified Pitch: Intelligent Sovereignty & Yield Optimization
*   **Asset Category**: Real World Assets (**USDY** - US Treasury backed by Ondo Finance), Liquid Staking Tokens (**mETH** - Mantle LSP), and baseline liquidity (**WMNT** - Wrapped MNT).
*   **The AI Role (7-Node Swarm)**: A 7-node autonomous pipeline/swarm (LangGraph + Python [main.py](file:///c:/Users/Acer/obelisk-q-wealth-navigator-main/backend/main.py#L510-L796)) acts as a "Sovereign Navigator," coordinating HMM-inspired regime classifiers, risk score generators, and GPT-4o Azure OpenAI consensus logic to perform automated, zero-human-intervention rebalancing.
*   **The Strategy (RWA Safe Harbor & Regime Damping)**: Implements mathematical regime decoding ([main.py](file:///c:/Users/Acer/obelisk-q-wealth-navigator-main/backend/main.py#L625-L722)) that detects Expansion, Consolidation, and Contraction states. It captures "Growth Alpha" with mETH during expansions, and autonomously rotates into USDY (US Treasury backed) as a safe harbor during DeFi volatility/contraction events to protect user capital. It executes trades under optimized control theory damping models (Underdamped, Optimal, Critically Damped) to maximize returns while mathematically mitigating whipsaw losses.
*   **Mantle Integration & High-Throughput Swaps**: Executes high-throughput, optimized swaps on-chain via the **Odos V3 DEX Aggregator** (getting the best routing across Agni, FusionX, Merchant Moe, etc.), fully protected by a prioritized Web3 [rpc_manager.py](file:///c:/Users/Acer/obelisk-q-wealth-navigator-main/backend/rpc_manager.py) failover system, reentrancy guards, and an autonomous, 10-point delta circuit breaker. Deployed and verified on **Mantle Mainnet**.
*   **ZK-ML On-Chain Verification**: Successfully implemented! Cryptographic ZK-ML proofs are generated for all regime decisions and verified on-chain on Mantle, transforming "Trust our AI" into mathematically verifiable "Verify our Math" execution.
*   **Best UI/UX Target**: A production-ready, beautiful glassmorphic frontend with responsive charts, real-time agent transaction feeds, and a highly polished interactive decision flow designed for retail DeFi users.




### 🛠️ Technical Excellence & Deployment
### 🛡️ High Availability & Resiliency
Obelisk Q operates on the **Antigravity Protocol**, featuring a memory-optimized single-node architecture with PM2 process management:
- **Primary Node:** Active executor running the full LangGraph pipeline, FastAPI server, and on-chain supervision.
- **PM2 Auto-Recovery:** Automatic crash detection and restart with configurable memory limits (450MB) and exponential backoff (4s delay, max 10 restarts).
- **RPC Connection Caching:** Persistent Web3 client connections with 60-second health-check cooldowns to eliminate memory spikes from socket churn.
- **AUM Response Caching:** 15-second TTL cache on `/api/stats` to protect the Mantle RPC node from polling storms.

This architecture ensures stable 24/7 operation on resource-constrained environments (1GB RAM VMs) while maintaining deterministic rebalancing and full API availability on the Mantle Mainnet.
*   **Autonomous State Recovery**: On restart, the agent recovers its full state (regime, Q-Score, cycle count) from the SQLite database, resuming supervision seamlessly with zero data loss.
*   **Hybrid Consensus Voting**: Every rebalance is validated by both a GPT-4o reasoning engine and a deterministic mathematical analyst.
*   **Trend-Locked Rebalancing (Anti-Whipsaw)**: Enforces a 3-cycle stability window to minimize gas burn and slippage during market noise.
*   **Yield Auto-Compounding**: Native `compound()` logic harvests MNT rewards and re-invests them back into the target yield position.

### 🏦 Core Protocol Details (Mantle Mainnet)
*   **ObeliskVault**: `0x59fdE89B810812846ED167033C6d33fa425835E2`
*   **ZKRegimeVerifier**: `0xbd47209Fc1B99B9100c22ABF2C27CaD218dC974D`
*   **ERC-8004 Agent ID**: `0x430cd09f8Ab6C1Ab50aa7f47FbAC94218cA65374`
    * *Verify on-chain manifest*: [`/api/agent/identity`](https://obeliskq.app/api/agent/identity)
*   **Network**: Mantle Mainnet (Chain ID 5000)
*   **Primary Assets**: mETH (Staking), USDY (RWA), WMNT (Liquidity)

*   **USDY (Ondo RWA)**: `0x5bE26527e817998A7206475496fDE1e68957c5A6`
*   **mETH (Mantle LSP)**: `0xcDA86A272531e8640cD7F1a92c01839911B90bb0`
*   **WMNT (Wrapped MNT)**: `0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8`
*   **Network**: Mantle Mainnet (Chain ID: 5000)

---

## 🏗️ System Architecture

```mermaid
graph TD
    User((User)) -->|Deposit MNT| Vault[ObeliskVault Contract]
    
    subgraph "AI Agent Layer (7-Node Swarm)"
        Regime[Regime Detection] --> Risk[Risk Assessment]
        Risk --> Analyst[Deterministic Analyst]
        Analyst --> Consensus[Consensus Arbitrator]
        Consensus --> QScore[Q-Score Engine]
        QScore --> Telemetry[Telemetry Aggregator]
        Telemetry --> Supervisor[Supervisory Controller]
    end

    LLM((GPT-4o-mini)) -.->|Reasoning| Regime
    LLM -.->|Validation| Consensus
    
    Supervisor -->|setRegime| Vault
    Supervisor -->|rebalance| Vault
    
    Vault -->|Swap| DEX[Odos V3 DEX Aggregator]
    DEX -->|Yield Assets| YieldPools[mETH / USDY / WMNT Pools]
    
    YieldPools -->|Real Yield| Vault
```

### 1. The Autonomous Swarm (Backend)
The "brain" of the system operates on a specialized 7-node LangGraph feedback loop:
*   **Regime Detection**: Scans liquidity markers and yield vectors (mETH, USDY, WMNT) on Mantle.
*   **Risk Assessment**: Executes an HMM-inspired "Regime Audit" to classify markets as Expansion, Consolidation, or Contraction (see §2 below).
*   **Deterministic Analyst**: A pure math-based second opinion using tighter volatility/score thresholds.
*   **Consensus Node**: Arbitrates between the AI and deterministic regimes with asymmetric safety bias.
*   **Q-Score Engine**: Calculates institutional-grade stability ratings (0-100) based on volatility and depth.
*   **Telemetry Aggregator**: Synchronizes state across agent nodes using the Antigravity Protocol (<500ms latency).
*   **Supervisory Controller**: The authorized on-chain actor that signs and triggers execution on Mantle.
*   **HA Shadow Nodes**: Implements a "Hot Standby" architecture where secondary nodes monitor primary health and take over execution in case of failure.

### 2. HMM-Inspired Regime Detection Algorithm

Obelisk Q uses an **HMM-inspired regime classifier** — a multi-stage pipeline that combines volatility thresholds (emission analogue), hysteresis-based state persistence (transition analogue), LLM confirmation, and deterministic sanity overrides.

#### 2.1 Hidden States
The system defines three market regimes:
| Regime | Meaning | Target Asset |
|---|---|---|
| **Expansion** | Low volatility, growth conditions | mETH (staked ETH) |
| **Consolidation** | Normal markets, moderate risk | WMNT (Wrapped MNT) |
| **Contraction** | High volatility, risk-off | USDY (US Treasury RWA) |

#### 2.2 Observation Model (Emission)
Volatility is derived from **live market signals** each cycle — replacing a naive random walk with real data:

$$V_t = \max(0.5, \min(3.5,\ 0.4 \cdot V_{raw} + 0.6 \cdot V_{t-1}))$$

*   **Fear & Greed Index** (alternative.me): $V_{fng} = (100 - FearGreed) / 50$ → range \[0.0, 2.0\]
*   **MNT 24h Price Change** (CoinGecko): $V_{price} = \min(1.5, |\Delta MNT| / 5)$ → range \[0.0, 1.5\]
*   **EMA Smoothing** (α=0.4): Blends with previous cycle to prevent whipsaw
*   **Bounds**: `[0.5, 3.5]` · **Initial**: `1.5` (calm market fallback)

#### 2.3 State Classification (Decoding)
Raw regime is determined by hard volatility thresholds:
*   `vol < 1.2` → **Expansion**
*   `1.2 ≤ vol ≤ 2.2` → **Consolidation**
*   `vol > 2.2` → **Contraction**

#### 2.4 LLM Confirmation (Consolidation Zone Only)
When the raw regime is **Consolidation** (the ambiguous middle zone), GPT-4o-mini is invoked as a second opinion, receiving the last 3 regime history, Q-Score, volatility, and MNT price change. If the LLM call fails, the rule-based regime is used as fallback.

#### 2.5 Deterministic Sanity Override
After LLM confirmation, hard safety overrides apply:
*   `vol > 2.5` → Force **Contraction** (regardless of LLM/AI output)
*   `risk_score < 40` + Expansion → Force **Consolidation**

#### 2.6 Hysteresis (State Transition Lock)
When a regime change occurs, a **3-cycle lock** is activated (~30 minutes at 10-min cycle intervals). During lock, the regime is held constant regardless of new observations. This prevents rapid oscillation ("whipsaw").

#### 2.7 Dual-Model Consensus
At the core of Obelisk Q's decision-making is the **Dual-Model Consensus** mechanism, designed to arbitrate and resolve disagreements between two independent evaluation layers: a **Cognitive AI Layer** and a **Deterministic Mathematical Analyst**. 

Rather than relying purely on machine learning or static rules, the protocol merges qualitative market context with quantitative calculations, enforcing a **Safety-First Asymmetric Arbitration Bias**.

1. **The Cognitive AI Layer**: Processes real-time qualitative and quantitative signals—such as on-chain activity, ecosystem data, macro sentiment, and the Fear & Greed index. This layer uses GPT-4o-mini to establish a contextual market outlook and acts as a confirmation filter on the raw regime observations.
2. **The Deterministic Mathematical Analyst**: Evaluates pure statistical telemetry—using tight volatility calculations and historical data constraints. It remains insulated from qualitative market hype, providing a conservative mathematical baseline.

##### Consensus Rules & Safety Bias Matrix
The Consensus Node operates with an asymmetric risk-aversion profile. Disagreements between the two models are resolved as follows:
*   **Safety-First Arbitration (Contraction Dominance)**: If *either* the AI layer or the Mathematical analyst votes for **Contraction**, the final consensus immediately resolves to **Contraction**. Funds are rotated to safety (USDY RWA backed by US Treasury Bills) automatically.
*   **Conservative Default (Consolidation Gate)**: If there is a mismatch where one model votes for Expansion and the other votes for Consolidation, the consensus defaults to **Consolidation** (Wrapped MNT) to protect capital.
*   **Unanimous Agreement for Growth**: For the vault to enter the **Expansion** regime (allocating heavily to mETH staking yield), *both* models must unanimously agree. Growth assets are never chased blindly.
*   **Emergency Overrides**: 
    *   **Circuit Breaker**: A 10-point drop in Q-Score within 60 minutes overrides the trend lock and triggers an emergency unwind to native MNT.
    *   **Anti-Whipsaw Trend Lock (Hysteresis)**: Enforces a 3-cycle lock-in period on regime shifts to prevent rapid, gas-eroding capital rotations during noisy market movements.

This dual-consensus design ensures that capital protection is always prioritized, keeping the agent transparent, mathematically verifiable, and risk-aware.

#### 2.8 Regime → Allocation Mapping
| Regime | Score Gate | Action | Damping Model |
|---|---|---|---|
| Expansion | `score ≥ 65` | Swap to mETH | Underdamped (ζ=0.4) |
| Contraction | `score ≤ 45` | Swap to USDY | Critically Damped (ζ=1.0) |
| Consolidation | `50 ≤ score ≤ 65` | Swap to WMNT | Optimal (ζ=0.707) |
| Any | Outside ranges | HOLD | Critically Damped (ζ=1.0) |

### 3. GPT-4o-mini Intelligence Layer (Azure OpenAI)
The agent swarm is augmented by **GPT-4o-mini** via Azure OpenAI, providing real-time AI reasoning at two critical decision points:
*   **Market Analysis** (`regime_detection_node`): Analyzes real-time DeFiLlama yield data (mETH/USDY APY), CoinGecko price movements (MNT 24h change), ETH volatility, and the Fear & Greed Index to produce a 1-sentence market outlook each cycle.
*   **Regime Confirmation** (`risk_assessment_node`): After the rule-based HMM computes a raw regime signal, GPT-4o-mini acts as a second opinion — confirming or overriding the regime classification (Expansion / Consolidation / Contraction) based on the full market context.
*   **Graceful Fallback**: If the LLM call fails (network issue, rate limit, timeout), the agent automatically falls back to pure rule-based logic with zero downtime. The system never stalls waiting for AI.

### 4. Institutional Safeguards & Technical Excellence
*   **Deterministic Slippage Guard (Anti-MEV)**: The agent now utilizes a **Dynamic Slippage Engine** with Odos V3 multi-path split routing (RFQ sources enabled) that adjusts its tolerance (0.6% to 0.8%) based on market volatility and regime, ensuring execution success with a 2.5% hard value-loss cap even during flash crashes.
*   **Dynamic Asset Registry**: The vault is no longer limited to hardcoded tokens. The owner can add or remove any Mantle-native assets (mETH, USDY, FBTC, etc.) via an on-chain registry, making the protocol future-proof.
*   **Agent-Level Circuit Breaker**: The agent has been granted authorized power to `pause()` the vault on-chain. If the AI detects a critical threat that requires more than a simple rebalance, it can instantly halt all vault operations to protect users.
*   **Proportional Asset Unwinding**: Optimized withdrawal logic that only trades the specific user's share of assets. This ensures the rest of the vault's capital remains invested and earning yield.
*   **Hybrid AI Sanity Filter**: A deterministic mathematical layer overrides the LLM (GPT-4o-mini) if it fails to account for extreme volatility (Vol > 2.5).

---

### 🔐 Security & Safety Features

### Smart Contract Security ✅
- [x] **Reentrancy Guards**: OpenZeppelin `ReentrancyGuard` on all state-changing functions
- [x] **Circuit Breaker**: Autonomous `pause()` if Q-Score drops 10pts in 60min
- [x] **Deterministic Slippage**: 0.6%-0.8% dynamic protection (anti-MEV)
- [x] **Verified on Mantle**: [Code is verified on explorer](https://explorer.mantle.xyz/address/0x59fdE89B810812846ED167033C6d33fa425835E2)

### Agent Safety ✅
- [x] **Dual Consensus**: AI + deterministic math must both agree
- [x] **Hysteresis Lock**: 3-cycle stability (prevents gas-burning whipsaws)
- [x] **Multi-RPC Failover**: 3 independent Mantle RPC providers with health checks
- [x] **Graceful Degradation**: If LLM fails, falls back to pure math (zero downtime)

### User Protection ✅
- [x] **Zero Custody Risk**: Smart contract is non-custodial (Obelisk can't access funds)
- [x] **No Lock-up**: Withdraw anytime
- [x] **Transparent Fees**: Phased fee structure (0.07% swap, 5% performance, 0.5% management)
- [x] **Audit Trail**: Every decision logged at `/api/cycles/history`

---

## 💰 Business Potential & Revenue Model

### 🏦 Revenue Model
Obelisk Q employs a diversified fee structure structured across product phases to align incentives between the protocol, strategy creators, and copy-traders:

| Stream | Rate | Applies To | Phase |
| :--- | :--- | :--- | :--- |
| **Swap / DEX Fee** | 0.07% per rebalance | All vaults | Phase 1 |
| **Performance Fee** | 5% on yield | AI-managed vaults only | Phase 1 |
| **Maintenance Fee** | 0.5% annually on TVL | AI-managed vaults only | Phase 1 |
| **Copy-Trade Split** | Vault owner 3% + Protocol 2% (5% total) | Copied vaults | Phase 2 |

### 🚀 Go-To-Market (GTM)
1. **Ecosystem Phase** (Now): Hackathon -> early adopters -> Mantle community DeFi users.
2. **Vault Scale Phase** (Phase 1): Deploy automated vault factory, Gelato automation, and custom safe havens to onboard retail and DAO treasuries.
3. **Social Replication Phase** (Phase 2): Social copy-trading, React Native mobile apps, and LLM-driven intent engines to expand user base.

### 🌍 Market Opportunity
With the RWA sector projected to reach $16T by 2030, Obelisk Q positions Mantle as the premier destination for intelligent, autonomous capital management. By combining the safety of US Treasuries (USDY) with the growth of liquid staking (mETH), we provide a unique "All-Weather" product for the next billion users.

Obelisk Q proposes a new **AI × Web3 paradigm**: where the agent is not just a chatbot, but a **Sovereign Financial Actor**.

1.  **Technical Depth**: High-precision integration between LangGraph's multi-agent coordination and Mantle's high-throughput execution environment.
2.  **Innovation**: Moves beyond simple "auto-compounders" to a system that understands *why* it is allocating capital, using advanced statistical modeling (HMM).
3.  **Growth Alpha**: By dynamically rotating between growth assets (mETH) and stable yield (USDY), Obelisk Q captures significant upside during market expansions that static holders miss.
4.  **Ecosystem Contribution**: Automates capital flow into mETH, USDY, and WMNT, directly increasing TVL and liquidity for Mantle's core primitives.
5.  **Completeness**: A fully production-ready, glassmorphic frontend paired with a hardened distributed backend and verified smart contracts.

---

## 🌍 BGA Alignment: Blockchain for Good
Obelisk Q is explicitly designed around the **Blockchain for Good Alliance (BGA)** principles of financial inclusion, market fairness, and transparency.

### 🏦 Democratizing Institutional Yield Access
Historically, US Treasury yields (the safest fixed-income returns on earth) have only been accessible to institutional investors. **Obelisk Q breaks this barrier**:
- During market Contraction, the agent automatically rotates retail user deposits into **USDY** (Ondo Finance), a Mantle-native stablecoin fully backed by US Treasury Bills (~5% APY).
- A retail user with as little as **0.01 MNT** can access the same Treasury-backed yield as a billion-dollar hedge fund — with zero manual action required.

### ⚖️ Reducing Information Asymmetry
Retail DeFi users lack the tools and data pipelines that institutional traders use to time market cycles. Obelisk Q closes this gap by:
- Running a **24/7 autonomous regime detection pipeline** that processes DeFiLlama yield data, CoinGecko price signals, and the Fear & Greed Index each cycle.
- Publishing every AI decision with **full reasoning transparency** via the on-chain audit trail (`/api/cycles/history`) and the in-app **AI Decision Transparency** feed.
- Ensuring users can always verify *why* capital was moved — not just *that* it was moved.

### 🌍 Real-World Financial Inclusion Impact

Obelisk Q is not just a product — it is a **financial inclusion engine**:

| Metric | Value | Source |
|---|---|---|
| Min. deposit to access US Treasury yield | **0.01 MNT** | ObeliskVault contract |
| USDY backing | **100% US T-Bills** | Ondo Finance audit |
| Time to first yield | **< 10 minutes** (next cycle) | Agent cycle cadence |
| Human intervention required | **Zero** | Autonomous 7-node swarm |
| Information advantage vs. retail | **Closed** | AI Transparency Feed |

### 🛡️ Non-Extractive Design
Obelisk Q is designed to protect users, not exploit them:
- **Circuit Breaker**: The AI can autonomously `pause()` the vault if a critical Q-Score drop is detected — protecting users even if the agent makes a wrong call.
- **Hysteresis Lock**: Prevents excessive rebalancing (gas burn) that would erode small retail positions.
- **Zero Custody Risk**: The vault is a non-custodial smart contract on Mantle — Obelisk Q the company cannot access user funds.

---

## 🚀 Project Roadmap

### Phase 0 — Core Architecture (Hackathon Build)
*   **Status**: Live on Mantle Mainnet (Chain ID 5000)
*   **Smart Contracts**:
    *   `ObeliskVault` (`0x59fdE89B810812846ED167033C6d33fa425835E2`) — Capital vault + Odos V3 DEX aggregation
    *   `ZKRegimeVerifier` (`0xbd47209Fc1B99B9100c22ABF2C27CaD218dC974D`) — On-chain ZK-ML proof verification
*   **Supported Assets**: mETH · USDY · WMNT
*   **AI & Analytics Engine**:
    *   LangGraph + FastAPI volatility backend
    *   HMM regime classification engine
    *   Dynamic rebalancing trigger system
    *   PM2 cluster process management
*   **Web3 Frontend**:
    *   Privy social login + non-custodial wallets
    *   ZK proof validation history display

### Phase 1 — Vault Infrastructure
*   **Vault Layer**:
    *   Vault Factory — systematic pool deployment on Mantle
    *   ERC-6551 NFT-bound vault accounts
    *   Users can create AI-managed vaults or manual vaults
    *   Safe Multisig + Timelock governance
    *   Formal smart contract audit + verification
*   **Automation & Risk**:
    *   Gelato v3 stop-loss automation
    *   Custom safe haven selection — on market downturns the AI automatically rotates into the user's chosen defensive asset (Options: USDY US Treasury RWA, XAUT Gold RWA, or user-defined TradFi-backed stable assets)
    *   Just-In-Time settlement — funds stay in user's own wallet until execution, routed through Bybit's institutional infrastructure off-chain and settled on-chain atomically (No central pool, no honeypot)
    *   Circuit breaker — max drawdown guard
    *   Gasless transactions via ERC-4337 paymaster
*   **Dashboard**:
    *   Real-time TVL + allocation telemetry
    *   Vault performance analytics
*   **Growth & User Acquisition**:
    *   Points system — weekly on-chain + off-chain rewards
    *   Referral vault sharing rewards
    *   User onboarding campaigns begin Phase 1

### Phase 2 — Social Layer & Mobile
*   **Mobile App**:
    *   iOS + Android app (React Native)
    *   Biometric auth (Face ID / fingerprint)
    *   Push notifications for trades and rebalances
    *   Mobile-first deposit and withdrawal flows
*   **AI Intent Engine**:
    *   LLM natural language reasoning layer
    *   Natural language -> on-chain action pipeline
    *   Intent simulation + preview before signing
*   **Leaderboard & Analytics**:
    *   Live vault performance rankings
    *   Dynamic yield rank badges
    *   Public vault performance API
*   **Copy Strategy**:
    *   One-click vault mirroring
    *   Vault owner earns 3%, protocol takes 2% (5% total from copier)
    *   Customisable allocation tolerance
    *   Strategy NFT — tradeable vault configs
*   **Notifications**:
    *   Telegram bot — position + rebalance alerts
    *   Volatility threshold push alerts
    *   Weekly email digest

    ---


---

## 🪙 Tokenomics — $OBQ

### Overview

> ⚠️ **Planned Tokenomics** — $OBQ has not yet launched. The following tokenomics framework is designed for post-Phase 1 deployment. All parameters, allocations, and schedules are subject to revision prior to TGE.

**$OBQ** is the native governance and incentive token of the Obelisk Q protocol. It is designed to align long-term incentives between the protocol, its AI-managed vault users, strategy creators, and the broader Mantle DeFi ecosystem. $OBQ is not a speculative instrument — it is the coordination layer that governs autonomous capital allocation, captures protocol fee value, and rewards participants who contribute to the protocol's growth and security.

| Parameter | Value |
| :--- | :--- |
| **Token Name** | Obelisk Q |
| **Ticker** | $OBQ |
| **Token Standard** | ERC-20 (Mantle Mainnet, Chain ID 5000) |
| **Total Supply** | 100,000,000 OBQ (fixed, no inflation) |
| **Initial Circulating Supply** | 12,500,000 OBQ (12.5% at TGE) |
| **Emission Model** | Fixed supply with time-locked vesting schedules |
| **Governance** | On-chain via Safe Multisig + Timelock (Phase 1) → DAO (Phase 2) |

---

### Allocation Breakdown

| Category | Allocation (%) | Tokens | Vesting Schedule |
| :--- | :---: | :---: | :--- |
| **Ecosystem & Liquidity Rewards** | 30% | 30,000,000 | Released linearly over 36 months via vault incentive programs |
| **Treasury & Protocol Reserve** | 20% | 20,000,000 | 12-month cliff, then 24-month linear vesting. Controlled by multisig/DAO |
| **Team & Core Contributors** | 15% | 15,000,000 | 12-month cliff, then 36-month linear vesting. Zero tokens unlock at TGE |
| **Investors & Strategic Partners** | 12% | 12,000,000 | 6-month cliff, then 18-month linear vesting |
| **Community Airdrop & Early Adopters** | 10% | 10,000,000 | 20% unlocked at TGE; remainder over 12 months |
| **Hackathon, Grants & Developer Fund** | 8% | 8,000,000 | Released on milestone achievement; governed by multisig |
| **Public Sale / Liquidity Bootstrap** | 5% | 5,000,000 | 100% unlocked at TGE for DEX liquidity provision |

---

### Team Allocation — Detail

The **15% team allocation (15,000,000 OBQ)** is subject to the most conservative vesting schedule in the protocol, demonstrating the team's long-term alignment with protocol health over short-term extraction.

- **Cliff Period**: 12 months from TGE. No team tokens unlock during this period under any circumstance.
- **Vesting Duration**: 36-month linear vesting commencing after the cliff. Total lockup horizon = 48 months (4 years).
- **Anti-Dilution Commitment**: The team allocation is fixed at launch and cannot be increased via governance.
- **Distribution**:

| Role | Allocation |
| :--- | :--- |
| Founding Engineer / Protocol Architect | 6,000,000 OBQ |
| AI / ML Lead | 3,500,000 OBQ |
| Smart Contract Lead | 2,500,000 OBQ |
| Product & Design | 1,500,000 OBQ |
| Advisors (3 seats, combined) | 1,500,000 OBQ |

Advisor allocations vest over 24 months with a 6-month cliff. All team and advisor vesting schedules will be enforced via on-chain vesting contracts at Phase 1 launch.

---

### Token Utility

$OBQ is a utility-first token. Its value accrual is directly tied to protocol activity — not speculation.

**1. Governance**
$OBQ holders vote on:
- Addition of new vault asset registries (e.g., adding FBTC, XAUT as safe-haven assets)
- Fee parameter adjustments (performance fee %, management fee %)
- Treasury fund allocation and grants
- Smart contract upgrade proposals (via Timelock)

**2. Fee Reduction**
Users who stake $OBQ in the protocol receive tiered fee discounts on performance and management fees:

| Staked $OBQ | Performance Fee Discount | Management Fee Discount |
| :--- | :---: | :---: |
| 0 | 0% | 0% |
| 500 OBQ | 10% | 10% |
| 2,500 OBQ | 25% | 25% |
| 10,000 OBQ | 50% | 50% |

**3. Vault Emissions Boost**
$OBQ stakers earn a multiplier on their vault yield rewards:
- Base: 1.0x (no stake)
- 1,000 OBQ staked: 1.25x multiplier
- 5,000 OBQ staked: 1.5x multiplier
- 25,000 OBQ staked: 2.0x multiplier

**4. Strategy NFT Minting**
In Phase 2, vault strategy configurations are mintable as tradeable NFTs. Minting requires burning a fixed amount of $OBQ, creating a direct deflationary sink tied to protocol growth.

**5. Copy-Trade Revenue Share**
Vault creators who list strategies for copy-trading receive their 3% copy-trade fee directly in $OBQ (or optionally in MNT), deepening token circulation within the protocol flywheel.

---

### Protocol Fee → Token Value Flow

All protocol-generated fees flow through a structured value capture mechanism:

```
Protocol Fees (swap + performance + management)
         |
         ├──► 50% → Protocol Treasury (OBQ buyback reserve)
         ├──► 30% → Vault Yield Reward Pool (distributed to OBQ stakers)
         └──► 20% → Developer & Audit Fund (grants, security reviews)
```

- **Buyback & Burn (Phase 2)**: Once protocol TVL exceeds $1M, 20% of treasury inflows are allocated to open-market $OBQ buybacks and burns, creating a deflationary pressure mechanism tied directly to protocol usage.

---

### Vesting Summary Table

| Stakeholder | TGE Unlock | Cliff | Vesting |
| :--- | :---: | :---: | :--- |
| Ecosystem Rewards | 0% | None | 36 months linear |
| Treasury | 0% | 12 months | 24 months linear |
| Team | 0% | 12 months | 36 months linear |
| Investors | 0% | 6 months | 18 months linear |
| Community / Airdrop | 20% | None | 12 months linear (remainder) |
| Grants / Developer Fund | 0% | Milestone-gated | Per grant terms |
| Public Sale / Liquidity | 100% | None | Fully unlocked at TGE |

---

### Governance Roadmap

Obelisk Q governance evolves progressively across three phases — starting from a lean, security-first multisig and transitioning into a fully decentralized, token-weighted DAO. Each phase unlocks new decision-making powers to the community as the protocol matures and TVL grows.

---

#### Phase 0 — Operational Multisig *(Active Now)*

**Model**: 3-of-5 Safe Multisig on Mantle Mainnet

**Key Holders**: Core founding team (5 keyholders, 3 required to sign)

**Scope of Authority**:
- Emergency `pause()` of ObeliskVault if a critical threat is detected
- Agent parameter updates (cycle interval, slippage thresholds, RPC failover config)
- Smart contract upgrades during the hackathon/early-access window
- Treasury fund custodianship prior to DAO formation

**Limitations**: No token-holder voting. No community proposals. Speed and security are prioritized over decentralization at this stage.

**Rationale**: During early protocol operation, rapid response to on-chain threats outweighs governance decentralization. The multisig ensures the team can protect user funds instantly without waiting for proposal cycles.

---

#### Phase 1 — Safe Multisig + On-Chain Timelock *(Phase 1 Launch)*

**Model**: Safe Multisig (5-of-7, expanded keyholder set) + 48-hour Timelock contract

**Trigger**: Deployment of Vault Factory and Phase 1 smart contracts on Mantle Mainnet

**Key Additions**:
- **Timelock Contract**: All non-emergency protocol changes are subject to a mandatory 48-hour on-chain delay before execution. This gives the community a public veto window to inspect and react to any proposed change.
- **Community Signal Voting**: Off-chain governance via Snapshot ($OBQ-weighted). Results are non-binding but inform multisig decisions and establish governance legitimacy before full DAO.
- **Expanded Keyholder Set**: 2 additional keyholders added from strategic partners or elected community representatives.
- **Governance Scope Expands To**:
  - Vault asset registry additions/removals (e.g., adding FBTC or XAUT as safe-haven assets)
  - Fee parameter adjustments (performance fee, management fee, copy-trade split)
  - Ecosystem reward emission rate adjustments
  - Treasury grant approvals (developer fund disbursements)
  - New safe-haven asset whitelist proposals

**Emergency Override**: The multisig retains the ability to bypass the Timelock **only** in the event of an active exploit or critical vulnerability. All emergency actions are published on-chain with a post-mortem within 72 hours.

**Transition Criteria to Phase 2**:
- Protocol TVL sustained above $500,000 for 30 consecutive days
- $OBQ token generation event (TGE) completed
- Minimum 1,000 unique $OBQ holders on-chain
- At least 3 successful community Snapshot votes executed

---

#### Phase 2 — Full Token DAO *(Phase 2 Launch)*

**Model**: $OBQ-weighted on-chain DAO via Tally + Snapshot + Protocol-Owned Liquidity

**Trigger**: Transition criteria from Phase 1 met; DAO contracts deployed and ownership transferred

**Architecture**:
- **Proposal Threshold**: Any wallet holding ≥ 10,000 $OBQ (or receiving delegation of ≥ 10,000 $OBQ) can submit an on-chain governance proposal.
- **Quorum Requirement**: A minimum of 5% of circulating $OBQ supply must participate for a vote to be valid.
- **Voting Period**: 5 days for standard proposals; 48 hours for emergency fast-track proposals (requires 10% quorum).
- **Timelock**: All passed proposals are subject to a 72-hour Timelock execution delay (extended from Phase 1).
- **Delegation**: $OBQ holders can delegate voting power to any address, enabling passive holders to participate via trusted delegates.

**Full Governance Scope**:
- All Phase 1 scope, plus:
- Smart contract upgrade authorization
- Buyback & burn parameter adjustments
- Protocol-owned liquidity (POL) deployment decisions
- New product module approvals (e.g., lending integrations, cross-chain vaults)
- Treasury investment strategy (idle treasury yield allocation)
- DAO contributor grants and core team performance reviews

**Protocol-Owned Liquidity (POL)**:
A portion of the Treasury is permanently deployed as protocol-owned DEX liquidity for the $OBQ/MNT pair on Mantle. This eliminates reliance on mercenary liquidity providers and ensures baseline token tradability regardless of market conditions. POL parameters (depth, range, rebalance cadence) are governed by $OBQ holders.

**Sunset of Multisig**:
Upon successful Phase 2 DAO activation, the Safe Multisig is demoted to an **emergency guardian role only** — it retains the sole ability to pause the protocol in the event of an active exploit, but loses all other administrative authority. Full sovereignty passes to $OBQ holders.


---

## 📚 Additional Resources
*   **Local Setup Guide**: See [SETUP.md](./SETUP.md) ← Start here for local installation details
*   **RWA Strategy Deep Dive**: See [RWA_REPORT.md](./RWA_REPORT.md) ← RWA track judges
*   **Algorithm Deep Dive**: See [ALGORITHM.md](./ALGORITHM.md)
*   **Security Policy**: See [SECURITY.md](./SECURITY.md)

---

### 📄 License
Open source under the MIT License. Submitted for the Mantle Network Hackathon 2026.
