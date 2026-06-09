# 🪐 Obelisk Q — Autonomous Sovereign Wealth Navigator
### Mantle Network Hackathon 2026 · AI & RWA Track + AI · Trading & Strategy Track

---

## 🎯 One-Line Pitch

> **The world's first autonomous AI wealth agent on Mantle — detecting market regimes in real time and rotating user capital between mETH staking yield and US Treasury-backed USDY, with every decision verified on-chain via Zero-Knowledge proofs.**

---

## 🔴 The Problem

August 5, 2024 — crypto markets lost **$500 billion in 72 hours**. Over **$600 million** in leveraged positions were liquidated in a single day. Retail users holding ETH, BTC, and DeFi positions had no warning. No protection. No exit.

October 2025 — a geopolitical flash crash wiped **$19 billion** in leveraged positions in hours. **1.62 million trader accounts** were liquidated. Exchange servers went down under the load.

These are not edge cases. This is the market.

Three structural problems make retail users permanently vulnerable:

| Problem | Impact |
|---|---|
| **No regime awareness** | Retail users hold static positions through crashes that institutional desks exit hours earlier |
| **US Treasury yield inaccessible** | ~5% APY safe-haven yield from US T-Bills is locked behind institutional access barriers |
| **No autonomous protection** | There is no system that automatically rotates retail capital to safety before a crash reaches them |

---

## ✅ The Solution: Obelisk Q

Obelisk Q is a **7-node autonomous AI swarm** running 24/7 on Mantle Mainnet. It reads live market conditions every 10 minutes, classifies the market into one of three hidden states, and autonomously rotates deposited capital between:

- **mETH** (Mantle Liquid Staking — growth yield during expansion)
- **WMNT** (Wrapped MNT — neutral position during consolidation)
- **USDY** (Ondo Finance — 100% US Treasury-backed safe harbor during contraction)

Users deposit MNT in 3 steps. The agent manages everything. Withdraw any time. No lock-up. No KYC. Minimum deposit: **0.01 MNT**.

---

## 🏗️ Technical Architecture: 3 Pillars

---

### PILLAR 1 — HMM Regime Detection Engine

At the core of Obelisk Q is a **Hidden Markov Model (HMM)-inspired regime classifier** — a probabilistic pipeline that reads the hidden state of the market from observable signals.

**Observation Model — Live Market Signals (every 10 min):**

| Signal | Source | Formula |
|---|---|---|
| Fear & Greed Index | alternative.me | `V_fng = (100 - FearGreed) / 50` → range [0.0, 2.0] |
| MNT 24h Price Change | CoinGecko | `V_price = min(1.5, |ΔMNT| / 5.0)` → range [0.0, 1.5] |
| BTC Institutional Sentiment | Bybit API | Qualitative context for LLM layer |

**EMA Smoothing (α=0.4)** prevents single-cycle noise from triggering costly swaps:
```
V_t = 0.4 × V_raw + 0.6 × V_(t-1)     bounded to [0.5, 3.5]
```

**State Classification:**
- `V_t < 1.2` → **Expansion** → Allocate to mETH
- `1.2 ≤ V_t ≤ 2.2` → **Consolidation** → Hold WMNT
- `V_t > 2.2` → **Contraction** → Rotate to USDY (US Treasury safe harbor)

**Anti-Whipsaw Hysteresis Lock:** After any regime change, a 3-cycle (~30 min) lock prevents the system from flipping back and forth at boundary conditions — saving gas and slippage on every cycle.

---

### PILLAR 2 — Dual-Model Consensus (AI + Math, Both Must Agree)

This is what makes Obelisk Q fundamentally different from scripted AI agents.

Most "AI agents" are an LLM wrapped around an API call. If the model hallucinates — users lose money. There is no check.

Obelisk Q requires **two completely independent layers to agree** before any capital moves:

**Layer 1 — Cognitive AI (GPT-4o-mini via Azure OpenAI)**
Reads qualitative signals: Fear & Greed index, DeFiLlama yield data, CoinGecko price movements, Bybit BTC sentiment. Produces a market outlook and regime confirmation.

**Layer 2 — Deterministic Mathematical Analyst**
Pure volatility thresholds. No opinions. No bias. No LLM. Just the numbers.

**Asymmetric Safety Bias (the key insight):**

| AI Node | Math Node | Final Decision | Reason |
|---|---|---|---|
| Expansion | Expansion | **Expansion** | Unanimous — growth permitted |
| Expansion | Consolidation | **Consolidation** | Safety default on disagreement |
| Consolidation | Expansion | **Consolidation** | AI's qualitative concern respected |
| **Contraction** | Any | **Contraction** | Contraction always wins |
| Any | **Contraction** | **Contraction** | Contraction always wins |

**Result:** AI hallucinations cannot cost users money. Bad signals from either model are caught by the other. Capital protection is structurally guaranteed — not hoped for.

**Emergency Circuit Breaker:** If the Q-Score (yield 40% + volatility 35% + liquidity 25%) drops 10+ points within 60 minutes, the agent autonomously calls `pause()` on the vault contract and unwinds to safety regardless of regime state.

---

### PILLAR 3 — ZK-ML On-Chain Verification + RWA Safe Harbor

**Zero-Knowledge Proofs for every regime decision:**
Every cycle, a ZK-ML proof is generated from the HMM output and verified on-chain through our `ZKRegimeVerifier` smart contract on Mantle Mainnet. Users don't need to trust us — they can cryptographically verify every decision the agent made.

```
ZKRegimeVerifier: 0xbd47209Fc1B99B9100c22ABF2C27CaD218dC974D
ObeliskVault:     0x59fdE89B810812846ED167033C6d33fa425835E2
```

**USDY as Autonomous Safe Harbor:**
During Contraction, 75% of vault capital rotates into **USDY** (Ondo Finance, Mantle-native), backed 100% by US Treasury Bills. A retail user with 0.01 MNT gets the same institutional Treasury protection that has historically only been available to hedge funds. Automatically. With no manual action.

**Allocation targets by regime:**

| Regime | USDY (RWA) | mETH (LST) | WMNT | Trigger |
|---|---|---|---|---|
| Expansion | 20% | 60% | 20% | V < 1.2 · Q-Score ≥ 70 |
| Consolidation | 45% | 40% | 15% | 1.2 ≤ V ≤ 2.2 |
| **Contraction 🛡️** | **75%** | 15% | 10% | V > 2.2 |

---

## 🤖 The 7-Node Swarm Architecture

```
[Regime Detection]  →  Reads Fear/Greed + MNT price → computes V_t via HMM
        ↓
[Risk Assessment]   →  HMM-inspired regime audit, volatility classification
        ↓
[Deterministic Analyst] → Pure math second opinion (no LLM)
        ↓
[Consensus Node]    →  Asymmetric arbitration — safety-first resolution
        ↓
[Q-Score Engine]    →  Computes 0-100 institutional safety index
        ↓
[Telemetry Aggregator] → State sync across nodes (<500ms, Antigravity Protocol)
        ↓
[Supervisory Controller] → ONLY authorized node to call vault on-chain
        ↓
   ObeliskVault (Mantle Mainnet) → rebalance() via Odos V3 DEX Aggregator
```

**Technology Stack:**
- **Backend:** Python + FastAPI + LangGraph (AI agent graph)
- **AI:** GPT-4o-mini via Azure OpenAI
- **Smart Contracts:** Solidity + OpenZeppelin on Mantle Mainnet (Chain ID 5000)
- **Frontend:** React 18 + TypeScript + Vite + Tailwind
- **DEX:** Odos V3 multi-path split routing (best execution across Agni, FusionX, Merchant Moe)
- **RPC:** Multi-provider failover (Mantle, PublicNode, Ankr)
- **Database:** SQLite with WAL mode + Redis heartbeat
- **Process:** PM2 with auto-recovery, 450MB memory limit

---

## 🔥 Battle-Tested on Mainnet

We want to be transparent: we hit two real problems during development on Mantle Mainnet — and fixed both.

**Problem 1 — High Slippage (occurred twice):**
DEX pool liquidity was thin at the wrong moment and our static slippage tolerance failed.

**Fix:** Fully dynamic slippage engine — 0.3% (consolidation) to 0.8% (contraction) based on live regime and volatility. Hard 2.5% value-loss cap. Price-impact abort at >0.3%. Minimum swap size enforced at 1 MNT to prevent dust trades. Switched to Odos V3 multi-path split routing across all major Mantle DEXes simultaneously.

**Problem 2 — ZK Proof Verification Failed:**
The `setRegimeWithZKProof` on-chain call was reverting. The ZKRegimeVerifier was rejecting valid proofs due to a volatility encoding mismatch in the proof inputs.

**Fix:** Input validation added before proof submission. Volatility encoding normalized to match the verifier's expected integer range. All proofs now submit and verify correctly.

These failures happened on Mainnet — with real transactions. The fixes are shipped. The fact that we found and resolved these issues means the system has been stress-tested in conditions most hackathon projects simulate.

---

## 🙋 User Experience — 3 Steps

1. **Connect wallet** — MetaMask or social login (Privy). No KYC. No whitelist.
2. **Deposit MNT** — Minimum 0.01 MNT. Enter amount, confirm on-chain.
3. **Done.** The 7-node swarm takes over.

Every 10 minutes: HMM runs → swarm decides → capital positioned. The user does nothing.

**Withdraw any time.** No lock-up. No penalty. The ObeliskVault is non-custodial — only the user can access their funds. The agent's Supervisor node can rebalance but cannot withdraw to any address other than the depositor.

---

## 📡 Live Verification Endpoints

All public. No authentication required.

| Endpoint | What It Shows |
|---|---|
| [`/api/agent/health`](https://obeliskq.app/api/agent/health) | Cycle count, current regime, Q-Score, uptime, RPC status |
| [`/api/rwa/status`](https://obeliskq.app/api/rwa/status) | Live regime, allocation targets, USDY/mETH APY, last rotation tx |
| [`/api/cycles/history`](https://obeliskq.app/api/cycles/history) | Full audit trail — every regime decision with volatility and score |
| [`/api/agent/identity`](https://obeliskq.app/api/agent/identity) | ERC-8004 Agent ID + on-chain manifest |

**Smart Contracts on Mantle Mainnet:**
- [ObeliskVault](https://explorer.mantle.xyz/address/0x59fdE89B810812846ED167033C6d33fa425835E2) — `0x59fdE89B810812846ED167033C6d33fa425835E2`
- [ZKRegimeVerifier](https://explorer.mantle.xyz/address/0xbd47209Fc1B99B9100c22ABF2C27CaD218dC974D) — `0xbd47209Fc1B99B9100c22ABF2C27CaD218dC974D`

---

## 🌍 BGA Alignment: Blockchain for Good

For centuries, the most powerful financial tools on earth — US Treasury bonds, institutional execution desks, algorithmic risk management — have been locked behind a wall. That wall is called **minimum investment size**. Hedge funds enter. Retail stays out.

Obelisk Q tears that wall down. On Mantle.

---

### 🏦 Democratizing Institutional-Grade Yield

During market Contraction, Obelisk Q automatically rotates user capital into **USDY** — Ondo Finance's Mantle-native token backed 100% by US Treasury Bills, earning ~5% APY. This yield has historically been accessible only to institutions managing tens of millions of dollars.

On Obelisk Q:
- **Minimum deposit:** 0.01 MNT *(vault contract threshold — anyone can enter)*
- **Minimum for agent execution:** 1 MNT *(the agent only fires swaps above this to prevent dust-amount trades suffering catastrophic slippage on thin pools)*
- **Time to first yield:** Under 10 minutes *(next agent cycle)*
- **Manual action required:** Zero

A retail user with a small balance gets the exact same Treasury-backed protection as a billion-dollar fund — automatically, non-custodially, and with full on-chain verifiability.

---

### ⚖️ Closing the Information Asymmetry Gap

Institutional trading desks run 24/7 data pipelines — Fear & Greed indices, DeFiLlama yield feeds, macro sentiment monitors, volatility models. They know when to exit. Retail users find out after the crash.

Obelisk Q runs the **same pipeline** and makes it public:
- Every regime decision is logged to `/api/cycles/history` — open, no auth required
- Every AI reasoning output is visible in the in-app **AI Decision Transparency** feed
- Every swap is verifiable on Mantle Explorer with a transaction hash
- Every ZK proof is verifiable on-chain via the `ZKRegimeVerifier` contract

Users don't just benefit from the intelligence — they can *audit* it.

---

### 🛡️ Non-Extractive by Design

Most DeFi yield products make money when users stay — even when they shouldn't. Obelisk Q is designed to do the opposite:

| Feature | What it protects |
|---|---|
| **Circuit Breaker** | Autonomously pauses the vault if Q-Score drops 10pts in 60 min — even if it costs protocol fees |
| **Hysteresis Lock** | Prevents overtrading that erodes small retail positions through gas fees |
| **Non-custodial vault** | Obelisk Q cannot access or redirect user funds — ever |
| **1 MNT swap minimum** | Protects small depositors from dust-trade slippage on thin liquidity pools |
| **2.5% hard value-loss cap** | Every swap aborts if output value drops more than 2.5% — even mid-execution |

The protocol earns when users earn. Not at their expense.

---

## 💰 Revenue Model

| Stream | Rate | Phase |
|---|---|---|
| Swap / DEX Fee | 0.07% per rebalance | Phase 1 |
| Performance Fee | 5% on yield generated | Phase 1 |
| Maintenance Fee | 0.5% annually on TVL | Phase 1 |
| Copy-Trade Split | Vault owner 3% + Protocol 2% | Phase 2 |

---

## 🚀 Roadmap

### ✅ Phase 0 — Core Intelligence Engine (Complete · Live on Mainnet)
- HMM regime classifier + 7-node LangGraph swarm
- Dual-model consensus (GPT-4o-mini + deterministic analyst)
- ZK-ML on-chain proof verification via ZKRegimeVerifier
- ObeliskVault with Odos V3 DEX aggregation + dynamic slippage engine
- Multi-RPC failover (Mantle, PublicNode, Ankr)
- PM2 HA process management + SQLite audit trail
- Full glassmorphic React dashboard

### 🔜 Phase 1 — Vault Infrastructure & Multi-Asset Expansion

The current architecture manages mETH and USDY. That's Phase 0. But the intelligence layer underneath — the HMM, the dual consensus, the ZK proofs — was built to scale far beyond two tokens.

Phase 1 opens Obelisk Q to the full TradFi-on-chain asset universe on Mantle:

- **Vault Factory** — any user can deploy their own AI-managed vault with custom risk parameters, custom asset weights, and their own defensive safe haven strategy
- **Multi-asset support** — FBTC (tokenized Bitcoin), XAUT (gold RWA), real estate tokens, and institutional TradFi assets as they arrive on Mantle
- **Custom safe haven selection** — users define what "safety" means to them: USDY (US Treasuries), XAUT (gold), or any TradFi-backed stable on Mantle

**⚡ Just-In-Time Settlement — Powered by Bybit's Institutional Infrastructure**

Phase 1 introduces a fundamentally safer capital model. We are integrating **Bybit's institutional execution infrastructure** — off-chain — while keeping user funds completely non-custodial at all times.

> *Funds never leave the user's own wallet until the exact moment a trade executes. That's Just-In-Time settlement.*

There is no honeypot. No central fund to hack. No pool of aggregated user deposits sitting on a server somewhere waiting to be exploited. Your money stays in your wallet — until the agent has earned the right to move it, found the optimal execution route, and is ready to settle atomically on-chain.

**🏗️ Custom Vault Builder**

Every user can build their own vault — their own risk parameters, their own target allocations, their own safe haven asset — all powered by the same HMM intelligence engine underneath. The AI adapts to the user's strategy. Not the other way around.

- **Gelato v3 stop-loss automation** + **ERC-4337 gasless transactions** via paymaster
- **ERC-6551 NFT-bound vault accounts** + Safe Multisig + Timelock governance
- Points system + referral vault sharing rewards for user acquisition

### 🔮 Phase 2 — Social Layer & Mobile
- **Social copy-trading** — publish vault strategy as a tradeable Strategy NFT; others mirror in one click; vault owner earns 3%, protocol 2%
- **iOS + Android app** (React Native) with biometric auth and push alerts
- **LLM intent engine** — natural language → on-chain action pipeline ("rotate 50% to USDY" → executes)
- **Telegram bot** — real-time regime alerts and rebalance notifications
- **Public leaderboard** — best autonomous AI strategies on Mantle, ranked by verified on-chain performance

---

## 🔗 Links

| Resource | URL |
|---|---|
| 🌐 **Live App** | [obeliskq.app](https://www.obeliskq.app/) |
| 💻 **GitHub** | [github.com/samixrd/Obelisk-Q](https://github.com/samixrd/Obelisk-Q) |
| 📊 **Live Agent Health** | [obeliskq.app/api/agent/health](https://obeliskq.app/api/agent/health) |
| 🏦 **Live RWA Status** | [obeliskq.app/api/rwa/status](https://obeliskq.app/api/rwa/status) |
| 📜 **Full Audit Trail** | [obeliskq.app/api/cycles/history](https://obeliskq.app/api/cycles/history) |
| 🔍 **Vault on Mantle Explorer** | [explorer.mantle.xyz](https://explorer.mantle.xyz/address/0x59fdE89B810812846ED167033C6d33fa425835E2) |

---

*Obelisk Q · Mantle Network Hackathon 2026 · MIT License*
*"Not another yield optimizer. The infrastructure layer for autonomous, inclusive, verifiable wealth management."*
