# 🛡️ Obelisk Q: Security Blueprint & Threat Model

Obelisk Q is an autonomous agent yield optimizer deployed on the **Mantle Network** (Chain ID `5000`). Operating in high-value, decentralized environments demands a state-of-the-art security blueprint. This document defines the comprehensive security architecture, quantitative safeguards, threat mitigations, and incident response procedures designed to guarantee absolute protection of user capital.

---

## 1. Smart Contract Security

The Obelisk Q Vault (`ObeliskVault.sol`) is engineered with defensive solidity practices, utilizing audited libraries and strict execution constraints.

### 1.1 Reentrancy Protection
All state-modifying, external-facing actions (such as `deposit`, `withdraw`, `rebalance`, and `compound`) are protected against reentrancy attacks using a custom, highly gas-optimized on-chain mutex lock:

```solidity
bool private _locked;

modifier nonReentrant() {
    require(!_locked, "ReentrancyGuard: reentrant call");
    _locked = true;
    _;
    _locked = false;
}
```
This strictly prevents same-block execution loop attacks (such as cross-contract callbacks trying to drain balances before the user state is updated).

### 1.2 Access Control Modifiers
The vault restricts administrative and trading privileges using two core modifiers:
*   `onlyOwner`: Restricts administrative functions (e.g., adding/removing managed assets, setting the agent address, setting the ZK verifier contract) to the governance multisig/deployer.
*   `onlyAgent`: Restricts active portfolio adjustment functions (`rebalance`, `compound`, `togglePause`) exclusively to the validated autonomous agent address.

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "ObeliskVault: not owner");
    _;
}

modifier onlyAgent() {
    require(msg.sender == agent || msg.sender == owner, "ObeliskVault: not agent");
    _;
}
```

### 1.3 Integer Overflow/Underflow Protection
The contract is compiled using **Solidity `^0.8.24`**, which natively integrates compiler-level overflow and underflow checks. Any arithmetic operation that exceeds the bounds of its numeric type (e.g. `uint256`) immediately reverts the entire transaction, preventing classic integer-based hacks.

### 1.4 Emergency Pause Functionality
The agent or owner can immediately pause new depositor actions and rebalance executions by toggling the `vaultPaused` state. This acts as a circuit-breaker fallback during extreme Mantle mainnet instability.

```solidity
function togglePause() external onlyAgent {
    vaultPaused = !vaultPaused;
    emit VaultPaused(block.timestamp);
}
```

---

## 2. Agent Security

Sovereign AI execution requires robust boundary control to ensure that machine learning and LLM components cannot make erroneous, high-risk, or manipulated decisions.

### 2.1 Dual-Model Consensus
Before any rebalance transaction is signed, both a qualitative Artificial Intelligence (LLM) Node and a quantitative Deterministic (Math) Node must classify the market conditions. 
*   **Arbitration Rule**: If the nodes disagree, the system defaults to the **most conservative regime** (Contraction/USDY > Consolidation/WMNT > Expansion/mETH).
*   **Asymmetric Priority**: AI or math can independently flag risk and force the safety rotation; a growth action (Expansion) requires unanimous, simultaneous agreement.

### 2.2 Sanity Overrides (Hard Thresholds)
To protect against "runaway AI" or model drift, the system enforces hard-coded quantitative boundaries:
*   **Panic Override**: If the smoothed realized volatility $V_t$ exceeds $2.5$, the system bypasses AI/consensus logic entirely and **FORCE-EXITS** all assets into **USDY (Contraction)**.
*   **Bull-Trap Guard**: If the current Q-Score is $<40$, the system actively prevents entering or remaining in the **Expansion** regime, regardless of LLM sentiment.

### 2.3 Autonomous Circuit Breaker
The system monitors Q-Score variance over a rolling window. If the Q-Score drops by **10 points or more within 60 minutes**, a circuit breaker triggers:
1.  Sets `CIRCUIT_BREAKER_ACTIVE = true`.
2.  Triggers `togglePause()` on-chain via the agent.
3.  Evacuates all growth positions, rotating 100% of holdings into **USDY** or unwinding to native **MNT**.
4.  Locks the agent in defensive mode, requiring manual governance intervention to reset.

### 2.4 LLM Fallback to Rule-Based Logic
If the LLM provider experiences outages, high API latency, or rate-limiting, the agent automatically falls back to pure rule-based, deterministic mathematical classification. This guarantees zero execution downtime.

---

## 3. Operational Security (SecOps)

Operational security prevents single-point-of-failure issues across blockchain infrastructure, node hosting, and databases.

### 3.1 Multi-RPC Failover Strategy
The agent monitors and rotates through a pool of three independent Mantle RPC endpoints (Mantle, PublicNode, Ankr). If an active provider times out ($\geq 15$s) or returns connection errors, the `RPCManager` dynamically rotates to the next healthy node in less than 1 second.

### 3.2 State Recovery from SQLite
To prevent cold-start failures or memory loss due to server reboots, the agent recovers its EMA Volatility Index, previous regime history, and consensus states from a persistent, local SQLite database on boot.

### 3.3 High-Availability (HA) Heartbeat and Leader Election
Multiple physical replica nodes are deployed across independent cloud providers (AWS, GCP, Vercel). The nodes coordinate leadership via a fast Redis key TTL heartbeat. If the primary node stops pulsing for over 60 seconds, a secondary replica instantly wins the leader election and resumes execution.
*   **Deduplication Lock**: A database cycle execution lock (`cycle_execution_lock` table) prevents multiple nodes from double-executing the same rebalance cycle.

### 3.4 ZK-ML Proof Verification
To achieve trustless execution, regime classification is verified on-chain. The agent generates a zero-knowledge proof of the HMM regime-detection calculation and calls `setRegimeWithZKProof()` on-chain. The vault contract validates this proof against the `ZKRegimeVerifier` contract, preventing transaction forging or spoofing.

---

## 4. User Security

User capital protection is the primary architectural driver of Obelisk Q.

### 4.1 Non-Custodial Vault Design
Users retain full ownership of their underlying capital at all times. 
*   **Zero Custody**: The agent cannot withdraw user funds, transfer them to third-party addresses, or custody them.
*   **Proportional Claims**: User shares are tracked on-chain via the `balances` mapping. Withdrawals always claim a direct, mathematical proportion of the vault's total assets.

### 4.2 Proportional Asset Unwinding
During a withdrawal, the vault dynamically calculates the user's precise share of mETH, USDY, and WMNT, swaps only that share back to native MNT, and payouts the proceeds. This protects the remaining vault depositors from slippage or yield leakage caused by a single user's exit.

### 4.3 Dynamic Slippage Protection
Before executing any rebalance swap or unwind operation, the agent queries the **Odos V3 DEX Aggregator** for the optimal multi-path route across all Mantle DEXs (Merchant Moe, Agni, FusionX, Butter, etc.). 

All swaps—including entering growth positions and unwinding active assets (`mETH`/`USDY` back to native `MNT`)—are protected by a triple-layer guard: dynamic slippage limits (0.3%–0.8%), a 0.3% price impact cap, and a 2.5% hard value-loss abort. 

By routing unwind operations through Odos swaps to `WMNT` on-chain instead of using the contract's internal zero-slippage `_unwindToken` loop, all transaction paths are strictly bound to dynamic `minAmountOut` parameters, protecting the vault from front-running and MEV sandwich attacks.

---

## 5. Data Security

Data integrity is required to preserve audit history and prevent environment leaks.

### 5.1 SQLite WAL (Write-Ahead Logging) Mode
The SQLite database utilizes Write-Ahead Logging (`WAL` mode) and `NORMAL` synchronous settings. This ensures transactional ACID compliance, prevents file corruption during server failures, and allows simultaneous read-heavy API actions without blocking active write cycles.

### 5.2 Audit Trail Logging
All regime decisions, volatility variables, consensus votes, ZK proofs, and transaction hashes are recorded permanently in the SQLite `agent_memory`, `agent_transactions`, and `regime_decisions` tables, providing a transparent, trustless, and historical audit trail.

### 5.3 Environment Variable Protection
All critical cryptographic materials (e.g. `AGENT_PRIVATE_KEY`, `PROVER_PRIVATE_KEY`, `MANTLE_RPC_URLS`) are strictly loaded via runtime environments (`.env.local` / system environment variables). They are never hard-coded or logged, and are isolated using `.gitignore` and `.vercelignore` filters.

---

## 6. Threat Vectors & Mitigations

| Threat Vector | Description | Obelisk Q Mitigation Strategy | Status |
|---|---|---|---|
| **Reentrancy Attack** | Attacker executes a recursive call to drain vault balances during withdrawal. | OpenZeppelin/custom `nonReentrant` mutex guard on all state-modifying functions. | **Active** |
| **Front-running / MEV** | Searchers front-run rebalance swaps, causing high slippage. | Odos V3 multi-path routing with RFQ sources + triple-layer slippage guard (0.3%–0.8% dynamic + 0.3% price impact + 2.5% value-loss hard cap) passed as `minAmountOut` on all entering swaps and UNWIND actions. | **Active** |
| **LLM Attack / Hallucination** | AI model fails, hallucinating high-risk positions or corrupted regimes. | Asymmetric Consensus Engine + Deterministic Math Override Node + Rule-based fallback. | **Active** |
| **RPC Downtime / DDOS** | RPC provider fails during a critical market contraction event. | `RPCManager` dynamically fails over and cycles across 3 Mantle RPC endpoints. | **Active** |
| **Oracle Manipulation** | Attackers manipulate on-chain price feeds to trigger artificial regime swaps. | Integration of multi-source sentiment inputs (Fear & Greed, Bybit, Coingecko simple simple simple spot prices). | **Active** |
| **DEX Liquidity Attack** | Low liquidity in mETH/USDY pools causes severe swap losses. | `S_liq` component of Q-Score penalizes illiquid assets, suppressing reallocation actions. | **Active** |
| **Node Crash / Server Halt** | Single backend hosting instance crashes during active execution. | Leader election heartbeat (Redis key TTL) + SQLite state recovery on boot. | **Active** |

---

## 7. Incident Response (Emergency Runbooks)

### 7.1 Emergency Pause Procedures
If an exploit, contract compromise, or black-swan network halt is identified:
1.  **Trigger Pause**: The operator or agent calls `togglePause()` to instantly freeze all deposits and rebalances.
2.  **Unwind Capital**: Governance calls `rebalance(address(0))` to unwind all remaining vault tokens (mETH, USDY, WMNT) back into native MNT, securing asset values.
3.  **Evaluate & Patch**: Codebases are updated, static analyzers (Slither/Mythril) are re-run, and governance deploys patches before unpausing.

### 7.2 RPC Failure Response
If all RPC endpoints fail:
1.  The agent falls back to random exponential retry intervals (`BACKOFF_FACTOR`).
2.  If offline for $>60$ seconds, the supervisory controller raises a `CRITICAL` alert and notifies administrative teams via external telemetry.
3.  Replicas remain active, querying healthy endpoints until connection is re-established.

### 7.3 Database Corruption Recovery
If the local SQLite database file gets corrupted:
1.  The agent halts the current cycle and locks itself to prevent double execution.
2.  Administrators restore the persistent SQLite database from the nearest automated backup.
3.  On restart, the agent queries the blockchain state via `sync_current_position()` to reconstruct the last known regime and balances, resuming operation cleanly.

---

## 8. Compliance & Governance

### 8.1 KYC/AML Awareness
Obelisk Q is a non-custodial, decentralized, autonomous protocol. It does not pool customer funds centrally or manage client balances off-chain, maintaining strict alignment with decentralized architecture. Compliance is facilitated via the dynamic whitelist integration at the gateway level.

### 8.2 Audit Trail Requirements
Every rebalance transaction has a corresponding audit hash in the `regime_decisions` table. This links the exact quantitative inputs (Fear/Greed, volatility, prices), ZK proof, and AI reasoning to the on-chain transaction hash, establishing an institutional-grade, transparent audit trail.

### 8.3 Non-Custodial Status
User deposits represent direct, proportional claims on the vault's assets. There is no transfer of ownership, credit risk, or administrative claim over client capital, preserving the trustless utility of decentralized finance.

---
*Obelisk Q: Shielding your capital through mathematical and agentic resilience.* 🪐
