# ⛽ Obelisk Q: Gas Efficiency & Economic Report

## 1. Unit Cost: Single Rebalance Execution
Obelisk Q is optimized for **Mantle Network**, leveraging its low L2 fees to provide high-frequency rebalancing that would be prohibitively expensive on Ethereum Mainnet.

| Operation | Gas Units | Cost (MNT) | Cost (USD) |
|---|---|---|---|
| **WMNT Wrap** | 5,000 | 0.005 | ~$0.003 |
| **Merchant Moe Swap** | 85,000 | 0.085 | ~$0.06 |
| **Storage Sync (setRegime)** | 12,000 | 0.012 | ~$0.009 |
| **Total** | **~102,000** | **~0.102 MNT** | **~$0.07** |

*Estimates based on Mantle average gas price of 0.1 gwei and MNT price of $0.72.*

---

## 2. Annual Operational Projection
Compared to traditional wealth management, Obelisk Q provides institutional-grade supervision at a fraction of the cost.

| Interval | Frequency | Annual Cost (MNT) | Annual Cost (USD) |
|---|---|---|---|
| **Manual Manager** | N/A | N/A | $50,000+ |
| **Obelisk Q** | 10 rebalances/mo | **~12.24 MNT** | **~$8.81** |

**Efficiency Factor**: Obelisk Q is **5,000x cheaper** than a junior quantitative manager while operating 24/7 with zero downtime.

---

## 3. Background Monitoring Cost
The Agent Swarm performs a "Market Audit" every 10 minutes. Because these cycles are off-chain (performing read-only telemetry), the monitoring cost is negligible.

*   **RPC Polling**: 0.00000 MNT (Free via public RPCs)
*   **Heartbeat (Redis)**: Off-chain coordination.
*   **Total Cycle Cost**: **$0.00**

---

## 4. Technical Gas Optimizations
To achieve this level of efficiency, the system implements several "Safety-First" gas optimizations:

1.  **Hysteresis Lock (Anti-Whipsaw)**: By enforcing a 3-cycle state lock, the agent avoids "jitter" rebalances during sideways markets, potentially saving 50-80% in annual slippage and gas.
2.  **Constant WMNT Mapping**: The vault uses hardcoded constant addresses for core liquidity pairs, saving 2,100 gas on storage reads during execution.
3.  **Idempotent rebalance()**: The contract checks state before execution. If the vault is already in the target position, the transaction reverts early or skips execution, preventing wasted gas on redundant signals.
4.  **Batch Regime Sync**: Market regime metadata is updated only when a rebalance occurs, bundling the data update with the asset swap.

---

## 5. Why Gas Efficiency Matters
The low-cost nature of Obelisk Q enables **Financial Inclusion**:
*   **Retail Accessibility**: Users with as little as 100 MNT can benefit from active management. On Ethereum, a single $50 gas fee would wipe out a year's yield; on Mantle, it represents less than 0.1% of the position.
*   **Compound Interest**: Frequent, low-cost rebalancing allows for tighter "Alpha" capture, ensuring the vault stays in the highest-yielding asset without the friction of high gas barriers.

**Obelisk Q democratizes the "Family Office" experience, putting an institutional quant team in every Mantle user's pocket.** 🪐
