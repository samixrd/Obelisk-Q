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

## 💰 Business Potential & GTM Strategy

### 🏦 Revenue Model ("2 & 20" Structure)
*   **Management Fee**: 2% annual AUM fee, streamed per cycle to the Obelisk DAO.
*   **Performance Fee**: 20% "High-Water Mark" fee on profits generated above the benchmark yield.
*   **Entry/Exit Fee**: 0%. No lock-in — full liquidity always.

### 🚀 Go-To-Market (GTM)
*   **Phase 1: Ecosystem Alignment**: Partnership with Mantle LSP and Ondo Finance.
*   **Phase 2: Institutional LPs**: Targeting DeFi funds and DAOs that require automated, risk-managed RWA exposure.
*   **Phase 3: Governance Token**: Launch of $OBELISK to decentralize the agent's risk parameters.

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

## 🚀 Roadmap (Future Implementations)
1. **Omnichain RWAs via LayerZero**: Future versions will integrate LayerZero to execute cross-chain rebalances.
2. **On-Chain Revenue Flow & Tokenomics**: We plan to launch the `$OBELISK` governance token and deploy automated fee-splitter smart contracts.
3. **ZK-ML (Zero-Knowledge Machine Learning)**: We will implement ZK-ML to generate on-chain proofs for every AI decision, moving from "Trust our AI" to "Verify our Math".
4. **Full EIP-4337 Account Abstraction**: We will implement full gasless (sponsored) transaction flows via Web3Auth/Biconomy, removing the need for retail users to hold MNT for gas.

---

## 🛠️ Getting Started
*   **Live Demo**: https://www.obeliskq.app/
*   **GitHub Repository**: https://github.com/samixrd/Obelisk-Q
