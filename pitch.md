# Obelisk Q: Autonomous RWA Wealth Navigator

🌍 **Website**: [www.obeliskq.app](https://www.obeliskq.app/)

## One-Line Pitch
The world's first autonomous multi-agent wealth navigator for institutional RWA yield on Mantle Network — making US Treasury returns accessible to every retail DeFi user.

## Winning Path: Grand Champion
Obelisk Q demonstrates excellence across technology, innovation, ecosystem contribution, and BGA (Blockchain for Good) principles by bridging the gap between high-fidelity AI orchestration and on-chain Real-World Assets.

---

### 1. Technical Depth (AI × On-Chain)
- **LangGraph Supervisory Graph**: A 7-node configuration (Regime, Risk, Analyst, Consensus, Score, Telemetry, Controller) arbitrating capital rotation.
- **GPT-4o-mini Intelligence Layer**: Powered by Azure OpenAI, the agent uses GPT-4o-mini at two critical nodes:
  - *Market Analysis* — Analyzes real-time DeFiLlama yield data, CoinGecko price data, Bybit institutional sentiment, and the Fear & Greed Index to generate AI-powered market insights each cycle.
  - *Regime Confirmation* — Acts as a second opinion on the HMM regime classification, confirming or overriding the signal based on full market context.
  - *Graceful Fallback* — If the LLM call fails, the agent automatically falls back to rule-based logic with zero downtime.
- **Agent Attestation**: Every autonomous decision is cryptographically signed and verifiable on the Mantle Network via `/api/cycles/history`.
- **Antigravity Protocol**: Ensures node-to-node telemetry synchronization stays below 500ms for state-drift prevention.
- **Bybit API Integration**: Real-time BTC institutional sentiment from Bybit is fed into each cycle's market context, aligning the agent's risk posture with institutional trading signals.

---

### 2. Innovation (The New Paradigm)
- **HMM Regime Switching**: Obelisk Q uses an HMM-inspired multi-stage pipeline (deterministic thresholds + LLM confirmation + sanity overrides + hysteresis lock) to detect market regimes (Expansion, Consolidation, Contraction) and adjust risk parameters automatically.
- **Sovereign Agent Identity**: Agents operate with ERC-8004 identities, creating a portable audit trail of competence.
- **Dynamic Yield Optimization**: Unlike static yield products, Obelisk Q rotates capital to capture "Growth Alpha" (e.g., mETH appreciation) during expansions while retreating to stable RWA yield (USDY / US Treasuries) during contractions.
- **Dual-Model Consensus**: Every regime decision requires agreement from both a GPT-4o-mini AI layer and a deterministic mathematical analyst — neither can dominate alone.

---

### 3. BGA Alignment: Blockchain for Good
This is not just a technical project — it is a **financial inclusion product**:

- **Democratizing US Treasury Access**: During market Contraction, the agent automatically rotates capital into **USDY** (Ondo Finance) — a Mantle-native token backed by US Treasury Bills. **USDY acts as an autonomous safe harbor during extreme DeFi volatility events.** A retail user with as little as 0.01 MNT receives the same institutional Treasury protection and yield, with zero manual intervention required.

- **Reducing Information Asymmetry**: Retail DeFi users lack institutional-grade market data pipelines. Obelisk Q runs a 24/7 regime detection pipeline fed by DeFiLlama, CoinGecko, Fear & Greed Index, and Bybit sentiment — and publishes every AI decision with full score breakdown transparency in the UI.

- **Non-Extractive by Design**:
  - Circuit Breaker autonomously `pause()`s the vault if a critical Q-Score drop is detected — protecting users from runaway AI.
  - Hysteresis lock prevents overtrading that erodes retail positions through gas fees.
  - Non-custodial vault: Obelisk Q the company cannot access user funds.

- **Market Fairness**: The asymmetric safety bias in Consensus (Contraction always wins in disagreements) ensures the system defaults to protecting capital rather than chasing yield — unlike extractive "yield optimizers" that maximize fees at users' expense.

---

### 4. Mantle Ecosystem Contribution
- **Native RWA Support**: Direct optimization for Mantle Staked Ether (**mETH**), Ondo **USDY**, and Wrapped MNT (**WMNT**).
- **DEX Activity**: All rebalances route through **Merchant Moe DEX**, driving real on-chain swap volume.
- **TVL Growth**: Every cycle increases demand for mETH and USDY pools on Mantle, growing ecosystem liquidity.

---

### 5. Product Completeness
- **Institutional UX**: A premium interface with guided onboarding tour, guest-mode telemetry (no wallet required), and a first-of-its-kind **AI Decision Transparency** feed showing every score component and regime decision in plain English.
- **Live on Mainnet**: Vault deployed and verified at `0x7924ce8e072c84D4028B04754207146e3aC6429A` on Mantle Mainnet (Chain ID 5000).
- **Judge-Ready Audit Endpoints**: `/api/agent/health`, `/api/cycles/history`, `/api/agent/transactions` — all public, no authentication required.

---

### 6. Roadmap: ZK-ML for Trustless Verifiability
While the current AI Transparency Feed provides human-readable auditability, our immediate next milestone is integrating **Zero-Knowledge Machine Learning (ZK-ML)** via Mantle's verification ecosystem. 
- **The Goal**: Generate cryptographic proofs that the autonomous agent's Q-Score and regime decisions exactly followed the stated model weights and LLM logic without hallucination or tampering.
- **The Impact**: Users will verify on-chain that the agent acted faithfully, transforming "Trust our AI" into "Verify our Math" — a critical leap for institutional RWA adoption.

---
**Obelisk Q is not just a demo; it is the blueprint for the next generation of autonomous, inclusive, and transparent DeFi finance.**


