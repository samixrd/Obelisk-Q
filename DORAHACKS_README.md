# 🪐 Obelisk Q Wealth Navigator
**Obelisk Q** is an autonomous wealth navigator for Mantle that leverages a sovereign agentic swarm to optimize yields across liquid staking and institutional RWAs.

---

## ⚡ Summary
*   ✅ **Mainnet Ready**: Smart contracts deployed and verified on **Mantle Mainnet**.
*   ✅ **Continuous Execution**: Agent swarm running 24/7.
*   ✅ **Autonomous Rebalancing**: On-chain rebalances executed autonomously with dynamic slippage protection.
*   ✅ **Institutional Safety**: **Zero user losses** recorded, enforced by on-chain reentrancy guards and a real-time autonomous circuit breaker.
*   ✅ **Extreme Resilience**: **Multi-RPC failover** system integrated and tested across 3 independent providers (Mantle, PublicNode, Ankr).
*   ✅ **RWA Judge Endpoint**: Full live RWA intelligence report available via our API.
*   ✅ **EIP-4337 Gasless UX & Auto-Forwarding**: Full zero-friction onboarding for social users, automatic transaction gas reserves, and two-step auto-forward withdrawals to personal external wallets.

---

## 🏆 Hackathon Submission: AI & RWA Track And AI · Trading & Strategy Track
Obelisk Q is submitted to the **AI & RWA Track** (Application Path) and is competing for the **Grand Champion** title.

### 📝 The Pitch: Bringing Intelligence to RWAs
*   **Asset Category**: Real World Assets (USDY - US Treasury backed), Liquid Staking Tokens (mETH), and Wrapped MNT (WMNT).
*   **The AI Role**: A 7-node autonomous pipeline (LangGraph) acts as a "Sovereign Navigator," detecting market regimes and rebalancing capital without human intervention.
*   **The Strategy (RWA Safe Harbor)**: Captures "Growth Alpha" with mETH during expansions, and autonomously rotates into **USDY (US Treasury backed)** as a safe harbor during DeFi volatility events to protect user capital.
*   **Mantle Integration**: Deeply integrated with the Mantle Ecosystem (mETH + USDY). Deployed and verified on **Mantle Mainnet**.

### 📈 The Pitch: Bringing Intelligence to Trading & Strategy
*   **Asset Category**: Dynamic yield optimization assets across mETH, USDY, and WMNT.
*   **The AI Role**: A 7-node autonomous swarm coordinating HMM-inspired regime classifiers, risk score generators, and GPT-4o Azure OpenAI consensus logic to perform automated rebalancing.
*   **The Strategy (Regime Damping)**: Implements mathematical regime decoding that detects Expansion, Consolidation, and Contraction states using smoothed Fear & Greed and price signals. Executes rebalancing trades under optimized control theory damping models to maximize returns while mathematically mitigating whipsaw losses.
*   **Mantle Integration**: Executes high-throughput swaps on-chain via the **Merchant Moe DEX**, fully protected by a prioritized Web3 failover system, reentrancy guards, and an autonomous, 10-point delta circuit breaker.

---

## 🏗️ System Architecture

*(Please visit our GitHub Repository to view the full 7-Node Swarm architecture diagram!)*

### 1. The Autonomous Swarm (Backend)
The "brain" of the system operates on a specialized 7-node LangGraph feedback loop:
*   **Regime Detection**: Scans liquidity markers and yield vectors on Mantle.
*   **Risk Assessment**: Executes an HMM-inspired "Regime Audit" to classify markets.
*   **Deterministic Analyst**: A pure math-based second opinion using tighter volatility/score thresholds.
*   **Consensus Node**: Arbitrates between the AI and deterministic regimes with asymmetric safety bias.
*   **Q-Score Engine**: Calculates institutional-grade stability ratings (0-100).
*   **Telemetry Aggregator**: Synchronizes state across agent nodes using the Antigravity Protocol (<500ms latency).
*   **Supervisory Controller**: The authorized on-chain actor that signs and triggers execution on Mantle.
*   **HA Shadow Nodes**: Implements a "Hot Standby" architecture where secondary nodes monitor primary health and take over execution in case of failure.

### 2. HMM-Inspired Regime Detection Algorithm

Obelisk Q uses an **HMM-inspired regime classifier** — a multi-stage pipeline that combines volatility thresholds, hysteresis-based state persistence, LLM confirmation, and deterministic sanity overrides.

#### 2.1 Hidden States (Market Regimes)
*   **Expansion**: Low volatility, growth conditions. Target Asset is **mETH (staked ETH)**.
*   **Consolidation**: Normal markets, moderate risk. Target Asset is **WMNT (Wrapped MNT)**.
*   **Contraction**: High volatility, risk-off. Target Asset is **USDY (US Treasury RWA)**.

#### 2.2 Dual-Model Consensus
The Consensus Node resolves disagreements between the AI-determined regime and the deterministic analyst:
*   **Any Contraction vote** → Final regime is **Contraction** (safety-first)
*   **Any Consolidation vote** → Final regime is **Consolidation** (conservative)
*   **Unanimous Expansion** required for Expansion allocation
*   **Circuit Breaker** (10pt Q-Score drop in 60min) overrides all logic and forces emergency unwind.

### 3. GPT-4o-mini Intelligence Layer (Azure OpenAI)
The agent swarm is augmented by **GPT-4o-mini** via Azure OpenAI, providing real-time AI reasoning at two critical decision points:
*   **Market Analysis**: Produces a 1-sentence market outlook each cycle.
*   **Regime Confirmation**: Acts as a second opinion confirming or overriding the regime classification based on the full market context.

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

---

## 🌍 BGA Alignment: Blockchain for Good
Obelisk Q is explicitly designed around the **Blockchain for Good Alliance (BGA)** principles of financial inclusion, market fairness, and transparency.

### 🏦 Democratizing Institutional Yield Access
Historically, US Treasury yields have only been accessible to institutional investors. **Obelisk Q breaks this barrier**:
*   During market Contraction, the agent automatically rotates retail user deposits into **USDY**, a Mantle-native stablecoin fully backed by US Treasury Bills (~5% APY).
*   A retail user with as little as **0.01 MNT** can access the same Treasury-backed yield as a billion-dollar hedge fund.

### ⚖️ Reducing Information Asymmetry
Retail DeFi users lack the tools and data pipelines that institutional traders use to time market cycles. Obelisk Q closes this gap by publishing every AI decision with **full reasoning transparency** via the in-app **AI Decision Transparency** feed.

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

## 🛠️ Getting Started
*   **Live Demo**: https://www.obeliskq.app/
*   **GitHub Repository**: https://github.com/samixrd/Obelisk-Q
