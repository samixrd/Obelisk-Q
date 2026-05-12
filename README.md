# Obelisk Q — Autonomous Wealth Intelligence on Mantle

**Obelisk Q** is the first autonomous wealth navigator optimized for Mantle Mainnet. It leverages a specialized 5-node LangGraph architecture to provide institutional-grade yield optimization across mETH and USDY (RWA), protected by a real-time autonomous circuit breaker.

---

## 🏆 Hackathon Submission: AI & RWA Track

Obelisk Q is submitted to the **AI & RWA Track** (Application Path) and is competing for the **Grand Champion** title.

### 📝 The Pitch: Bringing Intelligence to RWAs
*   **Asset Category**: Real World Assets (USDY - US Treasury backed), Liquid Staking Tokens (mETH), and Wrapped MNT (WMNT).
*   **The AI Role**: A 5-node autonomous swarm (LangGraph) acts as a "Sovereign Navigator," detecting market regimes and rebalancing capital between stable RWA yield, stable Mantle yield (WMNT), and aggressive staking growth without human intervention.
*   **Mantle Integration**: Deeply integrated with the Mantle Ecosystem (mETH + USDY). Deployed and verified on **Mantle Mainnet**.

### 🛠️ Technical Excellence & Deployment
*   ✅ **Mantle Mainnet Deployment**: [ObeliskVault (0x1cA9...)](https://explorer.mantle.xyz/address/0x1cA9813c83e6d012798acD19Af1CF87a91F119DD)
*   ✅ **Verified Contract**: Deployment confirmed on Mantle Explorer with deterministic rebalance logic.
*   ✅ **On-Chain AI Execution**: The supervisor ([0x5698...](https://explorer.mantle.xyz/address/0x5698E89Ec2396e02679ddde33c2BA78de88F7fce)) triggers execution on Mantle.
*   ✅ **Sovereign Identity**: Integrated with [ERC-8004](https://explorer.mantle.xyz/address/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432) for autonomous agent identity.

---

### 🏦 Core Protocol Details (Mantle Mainnet)
*   **ObeliskVault**: `0x1cA9813c83e6d012798acD19Af1CF87a91F119DD`
*   **ERC-8004 Agent ID**: `0x5698E89Ec2396e02679ddde33c2BA78de88F7fce`
*   **Identity Registry**: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
*   **Merchant Moe Router**: `0xeaEE7EE68874218c3558b40063c42B82D3E7232a`
*   **USDY (Ondo RWA)**: `0x8D6857216076fb05316B3C068694086E6689799c`
*   **mETH (Mantle LSP)**: `0xcDA86A272531e8640cD7F1a92c01839911B90bb0`
*   **WMNT (Wrapped MNT)**: `0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8`
*   **Network**: Mantle Mainnet (Chain ID: 5000)

---

## 🏗️ System Architecture

```mermaid
graph TD
    User((User)) -->|Deposit MNT| Vault[ObeliskVault Contract]
    
    subgraph "AI Agent Layer (5-Node Swarm)"
        Regime[Regime Detection] --> Risk[Risk Assessment]
        Risk --> QScore[Q-Score Engine]
        QScore --> Telemetry[Telemetry Aggregator]
        Telemetry --> Supervisor[Supervisory Controller]
    end

    LLM((GPT-4o-mini)) -.->|Analysis| Regime
    LLM -.->|Confirmation| Risk
    
    Supervisor -->|setRegime| Vault
    Supervisor -->|rebalance| Vault
    
    Vault -->|Swap| DEX[Merchant Moe DEX]
    DEX -->|Yield Assets| YieldPools[mETH / USDY / WMNT Pools]
    
    YieldPools -->|Real Yield| Vault
```

### 1. The Autonomous Swarm (Backend)
The "brain" of the system operates on a specialized 5-node LangGraph feedback loop:
*   **Regime Detection**: Scans liquidity markers and yield vectors (mETH, USDY, WMNT) on Mantle.
*   **Risk Assessment**: Executes a "Regime Audit" using Hidden Markov Models to classify markets as Expansion, Consolidation, or Contraction.
*   **Q-Score Engine**: Calculates institutional-grade stability ratings (0-100) based on volatility and depth.
*   **Telemetry Aggregator**: Synchronizes state across agent nodes using the Antigravity Protocol (<500ms latency).
*   **Supervisory Controller**: The authorized on-chain actor that signs and triggers execution on Mantle.
*   **HA Shadow Nodes**: Implements a "Hot Standby" architecture where secondary nodes monitor primary health and take over execution in case of failure.

### 3. GPT-4o-mini Intelligence Layer (Azure OpenAI)
The agent swarm is augmented by **GPT-4o-mini** via Azure OpenAI, providing real-time AI reasoning at two critical decision points:
*   **Market Analysis** (`regime_detection_node`): Analyzes real-time DeFiLlama yield data (mETH/USDY APY), CoinGecko price movements (MNT 24h change), ETH volatility, and the Fear & Greed Index to produce a 1-sentence market outlook each cycle.
*   **Regime Confirmation** (`risk_assessment_node`): After the rule-based HMM computes a raw regime signal, GPT-4o-mini acts as a second opinion — confirming or overriding the regime classification (Expansion / Consolidation / Contraction) based on the full market context.
*   **Graceful Fallback**: If the LLM call fails (network issue, rate limit, timeout), the agent automatically falls back to pure rule-based logic with zero downtime. The system never stalls waiting for AI.

### 4. Institutional Safeguards
*   **Autonomous Circuit Breaker**: Halts all capital allocation if the Q-Score drops 10 points within a 60-minute window.
*   **Yield-Inclusive Withdrawals**: Users earn yield on their entire proportional share of the vault, with an automated 0.01 MNT gas buffer for agent operations.
*   **Institutional Session Smoothing**: 30-minute inactivity window for professional stability.
*   **Real-Time Dashboards**: Premium UX with 10s telemetry polling, providing transparent visibility into the agent's logic.
*   **Verified Unwind Logic**: Deterministic cross-token swaps (mETH ↔ USDY) with a fixed safety buffer.

---

## 🎯 Innovation & Ecosystem Value

Obelisk Q proposes a new **AI × Web3 paradigm**: where the agent is not just a chatbot, but a **Sovereign Financial Actor**.

1.  **Technical Depth**: 30% of our focus is on the tight integration between LangGraph's multi-agent coordination and Mantle's high-throughput execution environment.
2.  **Innovation**: We move beyond simple "auto-compounders" to a system that understands *why* it is allocating capital, using advanced statistical modeling (HMM).
3.  **Growth Alpha**: By dynamically rotating between growth assets (mETH) and stable yield (USDY), Obelisk Q captures significant upside during market expansions that static holders miss.
4.  **Ecosystem Contribution**: By automating the flow of capital into mETH, USDY, and WMNT, we increase the TVL and utility of Mantle's core yield assets.
5.  **Completeness**: A fully runnable, responsive, and institutional-grade frontend paired with a hardened backend and verified smart contracts.

---

## 🛠️ Getting Started
*   **Official Website**: [www.obeliskq.app](https://www.obeliskq.app/)
*   **Setup Instructions**: See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
*   **Architecture Deep Dive**: See [src/pages/Docs.tsx](./src/pages/Docs.tsx)

---

### 📄 License
Open source under the MIT License. Submitted for the Mantle Network Hackathon 2026.
