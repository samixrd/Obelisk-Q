# Obelisk Q: Wealth Navigator

Obelisk Q is an **Autonomous Wealth Management Protocol** built on the Mantle Network. It combines sophisticated control theory (PID-inspired logic), multi-agent AI orchestration, and institutional-grade smart contracts to manage capital with high-frequency precision and transparency.

## 🏛️ Core Architecture

### 1. The Autonomous Rebalancing Engine (Backend)
The "brain" of the system, hosted on Azure and built using **LangGraph** and **Web3.py**. It operates on a multi-agent feedback loop:
*   **Analyst Agent**: Scans liquidity markers and yield vectors (mETH, USDY) on Mantle.
*   **Risk Manager Agent**: Executes a "Regime Audit." It calculates a real-time stability score based on market volatility.
*   **Tracker Agent**: Determines the "Control Law." It maps market regimes to specific assets:
    *   **Expansion** → Swap to **mETH** (Growth)
    *   **Contraction** → Swap to **USDY** (Hedge/Yield)
    *   **Consolidation/High Risk** → **HOLD** (MNT Cash)
*   **Executor Agent**: The authorized on-chain actor. It signs and broadcasts transactions to the Mantle Mainnet whenever the Risk Manager's confidence exceeds the 60/100 threshold.

### 2. The ObeliskVault (Smart Contracts)
A custom Solidity vault (`0xfEDA...1389`) that acts as the custodial layer for user funds:
*   **Native Integration**: Optimized for Mantle's native **MNT** token.
*   **DEX Connectivity**: Directly integrated with **Merchant Moe** (Mantle's premier DEX) using optimized `swapExactNativeForTokens` paths.
*   **Smart Transitions**: Automatically unwinds existing positions (e.g., selling mETH) before entering new ones (e.g., buying USDY) to ensure zero idle capital.
*   **Liquidity Buffer**: Maintains a 0.01 MNT "gas buffer" to ensure the vault can always be rebalanced without requiring external MNT injections.

### 3. The "Liquid OS" Interface (Frontend)
An institutional-grade dashboard designed with the **Apple Liquid OS** aesthetic:
*   **Glassmorphic UI**: High-end transparency effects and pill-shaped components.
*   **Real-time Decision Transparency**: Live "Agent Logs" that show the exact reasoning behind every rebalance.
*   **Q-Score Visualization**: A dynamic performance and risk metric that gives users instant clarity on protocol health.

## 🚀 Deployment Status
*   **Network**: Mantle Mainnet (Chain ID 5000)
*   **Vault Address: `0x0f433D5287dB6E3F8128bEDb96F68E0E50DaeaFa`
*   **Router**: `0xeaEE7EE68874218c3558b40063c42B82D3E7232a` (Merchant Moe)

## 🛠️ Getting Started
See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed setup and deployment instructions.
