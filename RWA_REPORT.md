# 🏦 Obelisk Q — RWA Strategy Report

> **Judge's Reference Document for the Mantle RWA Track**
>
> Live data: [`/api/rwa/status`](https://obeliskq.app/api/rwa/status) · [`/api/cycles/history`](https://obeliskq.app/api/cycles/history)

---

## What RWA Does Obelisk Q Integrate?

| Asset | Type | Backing | Contract (Mantle Mainnet) | Explorer |
|---|---|---|---|---|
| **USDY** | Real World Asset (RWA) | US Treasury Bills (Ondo Finance) | `0x5bE26527e817998A7206475496fDE1e68957c5A6` | [View](https://explorer.mantle.xyz/address/0x5bE26527e817998A7206475496fDE1e68957c5A6) |
| **mETH** | Liquid Staking Token (LST) | Ethereum staking rewards (Mantle LSP) | `0xcDA86A272531e8640cD7F1a92c01839911B90bb0` | [View](https://explorer.mantle.xyz/address/0xcDA86A272531e8640cD7F1a92c01839911B90bb0) |
| **WMNT** | Wrapped Native Token | MNT (Mantle's native token) | `0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8` | [View](https://explorer.mantle.xyz/address/0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8) |

---

## The Core RWA Strategy: USDY as Autonomous Safe Harbor

### The Problem Obelisk Q Solves
During DeFi volatility events (market crashes, liquidity crises, fear spikes), retail users face:
- Impermanent loss from volatile yield positions
- No automatic protection mechanism
- Inability to time markets like institutional desks

### The Solution: Regime-Driven RWA Rotation

Obelisk Q's 7-node AI swarm continuously monitors market conditions. When it detects a **Contraction regime** (high volatility, fear spike, MNT price crash), it autonomously rotates capital **into USDY** — Ondo Finance's Mantle-native US Treasury-backed token.

```
Market Event (Fear/Greed drops + MNT price crash)
    ↓
Volatility Signal V_t → breaches Contraction threshold (V > 2.2)
    ↓
Dual-Model Consensus: AI + Deterministic Analyst agree: CONTRACTION
    ↓
Q-Score drops below 45 (Action: ROTATE_TO_USDY)
    ↓  
On-chain: ObeliskVault.rebalance(USDY, target, calldata, minAmountOut) called on Mantle
    ↓
    Odos V3 DEX Aggregator executes swap at best rate (guarded at >0.5% price impact)
    ↓
User funds now earning ~5% US Treasury yield — safe from DeFi crash
```

### Allocation Targets by Regime

| Regime | USDY (RWA) | mETH (LST) | WMNT (Liquidity) | Trigger |
|---|---|---|---|---|
| **Expansion** | 20% | 60% | 20% | V < 1.2 · Q-Score ≥ 70 |
| **Consolidation** | 45% | 40% | 15% | 1.2 ≤ V ≤ 2.2 |
| **Contraction** 🛡️ | **75%** | 15% | 10% | V > 2.2 · USDY Safe Harbor |

---

## Volatility Signal: Real Market Data (Not Simulated)

The regime threshold is driven by **two live market signals** fetched every cycle:

### Signal 1 — Crypto Fear & Greed Index
```python
fng_vol = (100 - fear_greed) / 50.0   # range [0.0, 2.0]
# Source: https://api.alternative.me/fng/
```
- Fear/Greed = 0 (Extreme Fear) → V_fng = 2.0 → pushes toward Contraction
- Fear/Greed = 100 (Extreme Greed) → V_fng = 0.0 → permits Expansion

### Signal 2 — MNT 24h Price Change
```python
price_vol = min(1.5, abs(mnt_change) / 5.0)   # range [0.0, 1.5]
# Source: https://api.coingecko.com
```
- ±10% MNT move → V_price = 1.5 → strong Contraction signal
- ±1% MNT move → V_price = 0.2 → neutral

### EMA Smoothing (Anti-Whipsaw)
```python
vol = 0.4 * (0.5 + fng_vol + price_vol) + 0.6 * prev_vol
vol = max(0.5, min(3.5, vol))
```
EMA (α=0.4) prevents a single bad cycle from immediately triggering a rotation.

---

## USDY APY Data Source

Obelisk Q uses a **priority chain** for USDY yield data:

```
1. Ondo Finance Direct API   → https://ondo.finance/api/apy
2. DeFiLlama Fallback        → https://yields.llama.fi/pools (chain=Mantle, symbol=USDY)
3. Hardcoded Safe Default    → 5.1% APY
```

The agent logs which source was used each cycle:
```
INFO: telemetry: external API fetch (usdy_apy=5.1, source=ondo_direct)
```

---

## On-Chain Verifiability

Every regime rotation is recorded on Mantle Mainnet:

| Action | Contract Call | On-Chain Evidence |
|---|---|---|
| Regime change | `setRegime(regime_id)` | `tx_hash` in `/api/rwa/status` → `last_rotation_event` |
| Capital rotation | `rebalance(token, amount, slippage)` | tx hash verifiable on [Mantle Explorer](https://explorer.mantle.xyz) |
| Emergency pause | `pause()` | Circuit breaker event in `/api/agent/health` |
| Reward harvest | `compound()` | Increases vault TVL each cycle |

### Live Verification Steps for Judges
1. Call [`/api/rwa/status`](https://obeliskq.app/api/rwa/status) — see current regime, allocation target, live APY
2. Get `last_rotation_event.explorer_link` from the response
3. Open the link on Mantle Explorer — verify the on-chain `rebalance()` call
4. Call [`/api/cycles/history`](https://obeliskq.app/api/cycles/history) — full audit trail of every regime decision

---

## RWA Data Flow Architecture

```
[Ondo Finance API]     → USDY APY ─────────────────────────┐
[DeFiLlama API]        → mETH APY ─────────────────────────┤
[CoinGecko API]        → MNT 24h Δ ────────────────────────┤
[alternative.me API]   → Fear & Greed Index ────────────────┤
[Bybit API]            → BTC Institutional Sentiment ────────┤
                                                             │
                                                ┌────────────▼──────────────┐
                                                │   ExternalDataService      │
                                                │   (cached, TTL=30s)        │
                                                └────────────┬──────────────┘
                                                             │
                                          ┌──────────────────▼──────────────────┐
                                          │   regime_detection_node (Node 1)     │
                                          │   → Computes real volatility V_t      │
                                          │   → EMA smoothing                     │
                                          └──────────────────┬──────────────────┘
                                                             │
                                          ┌──────────────────▼──────────────────┐
                                          │   consensus_node (Node 4)            │
                                          │   → AI + Deterministic agree regime   │
                                          └──────────────────┬──────────────────┘
                                                             │
                                          ┌──────────────────▼──────────────────┐
                                          │   supervisor_node (Node 7)           │
                                          │   → Calls ObeliskVault.rebalance()   │
                                          │   → Calls ObeliskVault.setRegime()   │
                                          └──────────────────┬──────────────────┘
                                                             │
                                                     Mantle Mainnet
                                         ObeliskVault: 0x59fdE89B810812846ED167033C6d33fa425835E2
                                         ZKRegimeVerifier: 0xbd47209Fc1B99B9100c22ABF2C27CaD218dC974D
```

---

## Smart Contract Functions Used

```solidity
// Sets the current regime on-chain (creates immutable audit record)
function setRegime(uint8 _regime) external onlyAuthorized;

// Rotates capital between USDY / mETH / WMNT via Odos V3 DEX Aggregator
function rebalance(address targetToken, address swapTarget, bytes calldata swapCallData, uint256 minAmountOut) external payable onlyAuthorized;

// Emergency pause — triggered autonomously by circuit breaker
function pause() external onlyAuthorized;

// Harvests MNT rewards and re-invests into target position
function compound() external onlyAuthorized;
```

---

## Key Differentiator vs. Other RWA Protocols

| Feature | Obelisk Q | Static Yield Vaults | Manual RWA Protocols |
|---|---|---|---|
| Autonomous rotation | ✅ AI-driven | ❌ Fixed allocation | ❌ Manual |
| Real-time regime detection | ✅ Every 10 min | ❌ None | ❌ None |
| USDY safe harbor in crashes | ✅ Automatic | ❌ Stuck in volatile assets | ❌ Manual |
| On-chain audit trail | ✅ Full | ⚠️ Limited | ⚠️ Limited |
| AI decision transparency | ✅ Public feed | ❌ Black box | ❌ Black box |
| Min. deposit | ✅ 0.01 MNT | ⚠️ Usually high | ⚠️ Usually high |

---

*Obelisk Q · Mantle AI & RWA Hackathon 2026 · [github.com/samixrd/Obelisk-Q](https://github.com/samixrd/Obelisk-Q)*
