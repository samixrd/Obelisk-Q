# Obelisk Q — Autonomous Wealth Intelligence on Mantle

Obelisk Q is the first autonomous wealth navigator optimized for Mantle Mainnet. It leverages a multi-agent LangGraph architecture to provide institutional-grade yield optimization across mETH and USDY (RWA).

### 🏦 On-Chain Identity
*   **Vault Address**: `0x0f433D5287dB6E3F8128bEDb96F68E0E50DaeaFa`
*   **ERC-8004 Agent ID**: `0x5698E89Ec2396e02679ddde33c2BA78de88F7fce`
*   **Identity Registry**: [ERC-8004 Explorer](https://explorer.mantle.xyz/address/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432)
*   **Network**: Mantle Mainnet (Chain ID: 5000)

## 🏗️ System Architecture

```mermaid
graph TD
    User((User)) -->|Deposit MNT| Vault[ObeliskVault Contract]
    
    subgraph "AI Agent Layer (LangGraph)"
        Analyst[RWA Analyst] -->|Market Scan| Risk[Risk Manager]
        Risk -->|Regime Inference| Tracker[Control Tracker]
        Tracker -->|Action Payload| Executor[On-Chain Executor]
    end
    
    Executor -->|setRegime| Vault
    Executor -->|rebalance| Vault
    
    Vault -->|Swap| DEX[Merchant Moe DEX]
    DEX -->|Yield Assets| YieldPools[mETH / USDY Pools]
    
    YieldPools -->|Real Yield| Vault
```

### 1. The Autonomous Rebalancing Engine (Backend)
The "brain" of the system operates on a multi-agent feedback loop:
*   **RWA Analyst**: Scans liquidity markers and yield vectors (mETH, USDY) on Mantle.
*   **Risk Manager**: Executes a "Regime Audit" (Expansion, Contraction, Consolidation).
*   **Control Tracker**: Determines the optimal allocation payload.
*   **Executor**: Authorized on-chain actor that signs and broadcasts transactions to the Mantle Mainnet.

### 2. The ObeliskVault (Smart Contracts)
A custom Solidity vault that acts as the custodial layer:
*   **Native MNT Support**: Optimized for Mantle's native token.
*   **DEX Integration**: Directly connected with **Merchant Moe** for deep liquidity.
*   **Transparent Inference**: Market regimes are stored on-chain via the `setRegime` function.

## 🎯 Target Audience & RWA Pitch
Obelisk Q is designed for users who seek **institutional-grade Real World Asset (RWA)** exposure without the complexity of manual DeFi management.

| Archetype | Problem | Solution |
| :--- | :--- | :--- |
| **Passive Investor** | Idle capital on Mantle | Automated rebalancing into yield-bearing assets. |
| **DeFi Participant** | Complex pool management | Confidence-scored allocation via AI. |
| **Institutional** | Need for compliant RWA | Native exposure to USDY (US Treasuries). |

### 💎 Why Obelisk Q?
*   **Verified RWA Exposure**: Direct integration with USDY (Ondo Finance) for US Treasury-backed yield.
*   **On-Chain Transparency**: AI market inferences are recorded on-chain for permanent auditability.
*   **Liquid Staking**: Harnesses mETH (Mantle LSP) for high-availability ETH yield.

## 🛠️ Getting Started
See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed setup and deployment instructions.
