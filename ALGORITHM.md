# 🪐 Obelisk Q: HMM-Inspired Regime Detection Algorithm

## 1. Overview
In highly volatile DeFi ecosystems like Mantle, static allocation strategies often fail during sudden market shifts. **Obelisk Q** implements a specialized **Hidden Markov Model (HMM) inspired regime classifier** to autonomously navigate between Liquid Staking Tokens (mETH), Liquid RWAs (USDY), and Native Liquidity (WMNT).

By modeling the market as a set of hidden states with observable emissions (volatility), the algorithm ensures capital is always positioned in the optimal yield/risk bucket.

---

## 2. Hidden States (The Market Regimes)
The algorithm classifies the Mantle market into three discrete hidden states:

| State ($S_t$) | Market Condition | Primary Target | Strategy |
|---|---|---|---|
| **Expansion** | Low Volatility / Bullish | **mETH** | Maximize Staking Yield |
| **Consolidation** | Moderate Volatility / Sideways | **WMNT / HOLD** | Maintain Neutrality |
| **Contraction** | High Volatility / Bearish | **USDY (RWA)** | Capital Preservation (Treasuries) |

---

## 3. Observation Model (Emissions)
The "Observable" variable ($O_t$) is defined as **Realized Volatility**, modeled as a bounded random walk to simulate market noise and trends:

$$V_t = \max(0.5, \min(3.5, V_{t-1} + \epsilon))$$
Where $\epsilon \sim \text{Uniform}(-0.4, 0.4)$.

*   **Min Bound (0.5)**: Deep calm, high confidence.
*   **Max Bound (3.5)**: Extreme panic, zero confidence.

---

## 4. State Classification (Thresholds)
The transition from observation to state is governed by deterministic thresholds:

*   **$V_t < 1.2$**: $\rightarrow$ **Expansion**
*   **$1.2 \leq V_t \leq 2.2$**: $\rightarrow$ **Consolidation**
*   **$V_t > 2.2$**: $\rightarrow$ **Contraction**

---

## 5. LLM Confirmation (Cognitive Layer)
In the "Ambiguous Zone" (Consolidation), the system invokes a **GPT-4o-mini analyst** to provide qualitative validation. The LLM receives:
1.  Current Volatility & Yields.
2.  Last 3 Regime History (Transition context).
3.  Fear/Greed Index & Bybit Institutional Sentiment.

The LLM acts as a "State Refiner," preventing the system from prematurely exiting a trend during minor noise.

---

## 6. Deterministic Overrides (Hard Safety)
To prevent "Runaway AI" or model drift, the algorithm enforces two hard overrides:

1.  **Panic Override**: If $V_t > 2.5$, the system **FORCE-EXITs** to **USDY (Contraction)** regardless of LLM or Consensus results.
2.  **Bull-Trap Guard**: If $Q\text{-Score} < 40$ and the raw regime is "Expansion," the system forces a downgrade to **Consolidation** to prevent being trapped in a low-liquidity pump.

---

## 7. Hysteresis (Anti-Whipsaw Lock)
To minimize gas burn and slippage, Obelisk Q implements a **3-Cycle State Lock**:

$$\text{If } S_t \neq S_{t-1} \text{, then } S_{t+1}, S_{t+2} = S_t$$

Once a regime change occurs, the system is "locked" into that state for **30 minutes** (at 10-min cycle intervals). This ensures the trend is real before allowing another costly rebalance.

---

## 8. Dual Consensus Arbitration
Every decision is a vote between two independent nodes:
1.  **AI Node**: Reason-based classification (qualitative).
2.  **Deterministic Node**: Math-based classification (quantitative).

**Arbitration Rule**: If nodes disagree, the system defaults to the **Safer Regime** (Contraction > Consolidation > Expansion).

---

## 9. Allocation Mapping Table

| Regime | Q-Score | Delta ($\Delta$) | Action |
|---|---|---|---|
| Expansion | $\geq 80$ | $+5$ | **ALLOCATE_METH** |
| Consolidation | $60 - 79$ | $\pm 2$ | **SYNC / HOLD** |
| Contraction | $< 60$ | $-10$ | **ALLOCATE_USDY** |
| Panic | Any | Any | **CIRCUIT_BREAKER** |

---

## 10. Example Walkthrough: Cycle 1247
1.  **Observation**: $V_{1247} = 2.34$ (Jumped from 1.80).
2.  **Threshold Check**: $2.34 > 2.2 \rightarrow$ **Contraction Candidate**.
3.  **Hysteresis Check**: Last 5 cycles were "Consolidation". Lock is expired. Transition allowed.
4.  **LLM Audit**: LLM confirms "Sudden volatility spike on Bybit, exiting growth positions."
5.  **Consensus**: AI (Contraction) + Math (Contraction) = **Unanimous**.
6.  **Action**: Agent executes `rebalance(USDY_ADDRESS)` on Mantle Mainnet.
7.  **Result**: Capital secured in US Treasury RWAs within 45 seconds of the spike.
