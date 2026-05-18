# 🛡️ Obelisk Q: Security & Threat Model

## 1. Security Infrastructure
Obelisk Q is designed with a "Safety-First" architecture, ensuring that autonomous agent execution never compromises user capital.

### ✅ Threats Addressed & Mitigated
| Threat | Mitigation Strategy | Status |
|---|---|---|
| **Flash Loan Attacks** | Implementation of a **0.01 MNT execution buffer** and on-chain balance checks to prevent price manipulation during same-block swaps. | **Active** |
| **Front-running / MEV** | **Dynamic Slippage Control**: The agent calculates minimum expected output off-chain based on real-time DEX depth before signing transactions. | **Active** |
| **LLM Hallucination** | **Deterministic Override**: Every LLM decision is validated by a pure-math analyst node. If the AI "hallucinates" an impossible regime, the math node forces a safe fallback. | **Active** |
| **Reentrancy** | All on-chain vault functions (deposit, withdraw, rebalance) utilize OpenZeppelin's **ReentrancyGuard**. | **Active** |
| **RPC Downtime** | **Multi-RPC Failover**: The agent swarm monitors 3 independent Mantle providers (Mantle, PublicNode, Ankr) and rotates instantly on failure. | **Active** |
| **Q-Score Collapse** | **Autonomous Circuit Breaker**: If the market stability score drops >10 points in 60 minutes, the agent pauses all growth strategies and enters defensive mode. | **Active** |

---

## 2. Risk Limitations (Partial Mitigations)
We maintain a transparent posture regarding systemic risks that are currently partially mitigated:

*   **Smart Contract Bugs**: While the vault uses audited OpenZeppelin primitives, the custom `rebalance()` logic is currently undergoing an internal review. (Mitigation: Time-locked owner controls).
*   **Oracle Manipulation**: The system currently relies on the **Merchant Moe** on-chain liquidity depth as its primary price discovery mechanism. (Mitigation: Future integration of Chainlink/Pyth for cross-validation).
*   **Mantle Network Failure**: If the entire Mantle Network experiences a halt, the agent will be unable to sign transactions. (Mitigation: Roadmap includes cross-chain "Panic Signal" broadcasting).

---

## 3. Security Roadmap & Audit Timeline
1.  **V1 Internal Review**: Completed May 12, 2026.
2.  **Static Analysis (Slither/Mythril)**: Completed May 14, 2026.
3.  **Community Bug Bounty**: Scheduled for August 2026.
4.  **External Audit (Tier 1 Firm)**: Q4 2026.

---

**Obelisk Q is built for resilience. Our goal is not just to trade, but to protect.** 🪐
