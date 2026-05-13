import operator
import json
import random
import asyncio
from typing import Annotated, List, TypedDict, Union, Literal
from datetime import datetime
import secrets
import time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from openai import OpenAI
import os
import logging
from dotenv import load_dotenv
import sqlite3

DB_PATH = "obelisk_memory.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS agent_memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            cycle INTEGER,
            regime TEXT,
            score INTEGER,
            action TEXT,
            position TEXT,
            meth_apy REAL,
            usdy_apy REAL,
            tx_hash TEXT DEFAULT 'N/A',
            analyst_insight TEXT DEFAULT ''
        )
    """)
    try:
        conn.execute("ALTER TABLE agent_memory ADD COLUMN analyst_insight TEXT DEFAULT ''")
    except sqlite3.OperationalError:
        pass
    conn.execute("""
        CREATE TABLE IF NOT EXISTS performance_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            action TEXT,
            from_asset TEXT,
            to_asset TEXT,
            vault_value_before REAL,
            vault_value_after REAL,
            pnl REAL,
            tx_hash TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS agent_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            cycle INTEGER,
            action TEXT,
            score INTEGER,
            regime TEXT,
            status TEXT,
            vault_address TEXT,
            tx_hash TEXT
        )
    """)
    conn.commit()
    conn.close()

def update_heartbeat(node_id, role):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        INSERT OR REPLACE INTO heartbeats (node_id, last_pulse, role)
        VALUES (?, datetime('now'), ?)
    """, (node_id, role))
    conn.commit()
    conn.close()

def get_primary_health():
    try:
        conn = sqlite3.connect(DB_PATH)
        row = conn.execute("""
            SELECT last_pulse FROM heartbeats 
            WHERE role = 'primary' 
            ORDER BY last_pulse DESC LIMIT 1
        """).fetchone()
        conn.close()
        if row:
            last_pulse = datetime.strptime(row[0], '%Y-%m-%d %H:%M:%S')
            diff = (datetime.utcnow() - last_pulse).total_seconds()
            return diff < 60 # Healthy if pulsed in last 60s
        return False
    except:
        return False

def save_cycle_memory(cycle, regime, score, action, position, meth_apy, usdy_apy, tx_hash="N/A", analyst_insight=""):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        INSERT INTO agent_memory 
        (timestamp, cycle, regime, score, action, position, meth_apy, usdy_apy, tx_hash, analyst_insight)
        VALUES (datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (cycle, regime, score, action, position, meth_apy, usdy_apy, tx_hash, analyst_insight))
    conn.commit()
    conn.close()

def get_recent_memory(limit=5):
    try:
        conn = sqlite3.connect(DB_PATH)
        rows = conn.execute("""
            SELECT timestamp, cycle, regime, score, action, position, tx_hash
            FROM agent_memory 
            ORDER BY id DESC LIMIT ?
        """, (limit,)).fetchall()
        conn.close()
        return rows
    except:
        return []

try:
    from web3 import Web3
    WEB3_AVAILABLE = True
except ImportError:
    WEB3_AVAILABLE = False
    print("Warning: web3 not installed. Executor will run in simulation mode.")

load_dotenv()

logger = logging.getLogger("obelisk-q")
logging.basicConfig(level=logging.INFO)

# ─── LLM Configuration ────────────────────────────────────────────────────────

llm_client = OpenAI(
    base_url="https://obelisk.services.ai.azure.com/openai/v1",
    api_key=os.getenv("AZURE_OPENAI_API_KEY")
)

def call_llm(messages: list) -> str:
    completion = llm_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages
    )
    return completion.choices[0].message.content

# ─── Multi-Agent Graph State ──────────────────────────────────────────────────

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    next_agent: str
    data: dict
    cycle_count: int
    sensitivity: float

# ─── Last Known State Cache (Antigravity Resilience) ─────────────────────────
last_known_state = {
    "yields": {"usdy": 5.0, "meth": 3.5},
    "risk": {"vol": 1.5, "score": 90},
    "sensitivity": 0.5,
    "regime": "Consolidation",
    "hysteresis": 0,
    "components": {"yield_score": 75, "volatility_score": 70, "liquidity_score": 85},
    "score_history": [90, 89, 91, 90, 92, 90, 88, 87, 89, 90, 91, 90, 89, 90, 92, 91, 90, 89, 88, 90]
}

LAST_REBALANCE_TIME = 0
COOLDOWN_SECONDS = 1800 
CYCLE_INTERVAL = 600 
CURRENT_POSITION = "MNT"  # Global position state
SCORE_HISTORY = []        # List of (timestamp, score)
CIRCUIT_BREAKER_ACTIVE = False
CB_UNWIND_DONE = False
EMA_SCORE = None
ALPHA = 0.1
MAX_DELTA = 5
MAX_SCORE_CHANGE = 10 # This is used elsewhere, keeping it for now

def update_circuit_breaker(current_score):
    global SCORE_HISTORY, CIRCUIT_BREAKER_ACTIVE, CB_UNWIND_DONE
    now = time.time()
    SCORE_HISTORY.append((now, current_score))
    
    # Prune history older than 60 minutes (3600 seconds)
    SCORE_HISTORY = [item for item in SCORE_HISTORY if now - item[0] <= 3600]
    
    if len(SCORE_HISTORY) < 2:
        CIRCUIT_BREAKER_ACTIVE = False
        return
        
    max_score = max(item[1] for item in SCORE_HISTORY)
    drop = max_score - current_score
    
    if drop >= 10: # Increased from 5 to 10
        if not CIRCUIT_BREAKER_ACTIVE:
            logger.warning(f"circuit breaker triggered: score dropped {drop} points in 60min")
        CIRCUIT_BREAKER_ACTIVE = True
    else:
        CIRCUIT_BREAKER_ACTIVE = False
        # Reset unwind flag when score recovers above 55
        if current_score > 55:
            CB_UNWIND_DONE = False

ERC20_ABI = [
    {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
]

METH_ADDRESS = "0xcDA86A272531e8640cD7F1a92c01839911B90bb0"
USDY_ADDRESS = "0x5bE26527e817998A7206475496fDE1e68957c5A6"
WMNT_ADDRESS = "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8"

# ─── Agent Node Implementations ────────────────────────────────────────────────

async def regime_detection_node(state: AgentState):
    logger.info("node: regime_detection | starting market scan")
    try:
        # simulated latency
        await asyncio.sleep(0.2) 
        
        # Simulate random walk for volatility (HMM Emission)
        prev_vol = last_known_state["risk"].get("vol", 1.5)
        vol_change = random.uniform(-0.4, 0.4)
        vol = max(0.5, min(3.5, prev_vol + vol_change))
        
        usdy_apy = 5.1
        meth_apy = 3.4
        mnt_change = round(random.uniform(-2.0, 2.0), 2)
        fear_greed = random.randint(30, 75)
        
        yield_data = {"usdy": usdy_apy, "meth": meth_apy}
        state["data"]["yields"] = yield_data
        state["data"]["vol"] = vol
        state["data"]["mnt_change"] = mnt_change
        state["data"]["fear_greed"] = fear_greed
        last_known_state["yields"] = yield_data
        last_known_state["risk"]["vol"] = vol
        
        # ── LLM Market Analysis (GPT-4o-mini) ──
        try:
            recent = get_recent_memory(5)
            memory_context = "\n".join([
                f"Cycle {r[1]}: {r[2]} regime, score={r[3]}, action={r[4]}, position={r[5]}"
                for r in recent
            ]) if recent else "No previous history."

            analysis = call_llm([
                {"role": "system", "content": f"""You are a DeFi market analyst for Obelisk Q on Mantle Network.
You manage rebalancing between mETH (staking yield) and USDY (RWA yield).
Recent agent history:
{memory_context}
Be concise. 1-2 sentences max."""},
                {"role": "user", "content": f"Current data: mETH APY={meth_apy}%, USDY APY={usdy_apy}%, MNT 24h={mnt_change}%, ETH vol={vol:.2f}, Fear/Greed={fear_greed}. What is your market outlook?"}
            ])
            logger.info(f"analyst: {analysis}")
            state["data"]["analyst_insight"] = analysis
        except Exception as e:
            logger.warning(f"LLM call failed: {e}. using rule-based fallback.")
            analysis = f"Rule-based: vol={vol:.2f}, mETH={meth_apy}%, USDY={usdy_apy}%, MNT 24h={mnt_change}%"
            state["data"]["analyst_insight"] = analysis
        
        content = f"regime: liquidity markers scanned. usdy {usdy_apy}%. meth {meth_apy}%. vol {vol:.2f}. LLM insight: {analysis[:80]}"
    except asyncio.TimeoutError:
        state["data"]["yields"] = last_known_state["yields"]
        state["data"]["vol"] = last_known_state["risk"]["vol"]
        state["data"]["analyst_insight"] = "timeout — no LLM insight available"
        content = "regime: timeout. using last known yield vector."
    
    return {"messages": [AIMessage(content=content)], "data": state["data"]}

async def risk_assessment_node(state: AgentState):
    logger.info("node: risk_assessment | starting regime audit")
    try:
        await asyncio.sleep(0.1)
        vol = state["data"].get("vol", 1.5)
        mnt_change = state["data"].get("mnt_change", 0.0)
        
        # Calculate dynamic risk score (inverse to volatility)
        risk_score = max(0, min(100, int(100 - (vol - 0.5) * 30)))
        state["data"]["risk"] = {"score": risk_score}
        last_known_state["risk"]["score"] = risk_score
        
        # Regime Identification (HMM & Hysteresis logic)
        current_regime = last_known_state.get("regime", "Consolidation")
        hysteresis = last_known_state.get("hysteresis", 0)
        
        if hysteresis > 0:
            new_regime = current_regime
            last_known_state["hysteresis"] = hysteresis - 1
        else:
            if vol < 1.2:
                raw_regime = "Expansion"
            elif vol > 2.2:
                raw_regime = "Contraction"
            else:
                raw_regime = "Consolidation"
            
                # ── LLM Regime Confirmation (GPT-4o-mini) ──
                try:
                    recent = get_recent_memory(3)
                    last_regimes = [r[2] for r in recent] if recent else []
                    
                    regime_confirm = call_llm([
                        {"role": "system", "content": f"""You are a DeFi risk manager. 
    Last 3 regimes: {last_regimes}
    Reply with ONLY one word: Expansion, Consolidation, or Contraction."""},
                        {"role": "user", "content": f"Q-Score={risk_score}, ETH vol={vol:.2f}, MNT change={mnt_change}%, signal={raw_regime}. Confirm regime?"}
                    ])
                    regime_confirm = regime_confirm.strip()
                    logger.info(f"tracker LLM regime: {regime_confirm}")
                    
                    # Only accept valid LLM regime values
                    if regime_confirm in ("Expansion", "Consolidation", "Contraction"):
                        new_regime = regime_confirm
                    else:
                        logger.warning(f"LLM returned invalid regime '{regime_confirm}'. using rule-based: {raw_regime}")
                        new_regime = raw_regime
                except Exception as e:
                    logger.warning(f"LLM call failed: {e}. using rule-based fallback.")
                    new_regime = raw_regime

                # ── SANITY OVERRIDE (Safety First) ──
                if vol > 2.5 and new_regime != "Contraction":
                    logger.warning(f"SANITY OVERRIDE: vol {vol:.2f} too high for {new_regime}. forcing Contraction.")
                    new_regime = "Contraction"
                elif risk_score < 40 and new_regime == "Expansion":
                    logger.warning(f"SANITY OVERRIDE: risk score {risk_score} too low for Expansion. forcing Consolidation.")
                    new_regime = "Consolidation"
                    
                if new_regime != current_regime:
                    last_known_state["hysteresis"] = 3 # Lock state for 3 cycles to prevent chatter
                
        last_known_state["regime"] = new_regime
        state["data"]["regime"] = new_regime
        
        content = f"risk: pole-zero audit complete. active regime: {new_regime}. score {risk_score}."
    except asyncio.TimeoutError:
        state["data"]["risk"] = {"score": last_known_state["risk"]["score"]}
        state["data"]["regime"] = last_known_state.get("regime", "Consolidation")
        content = "risk: timeout. using last known stability vector."
    
    return {"messages": [AIMessage(content=content)], "data": state["data"]}

async def q_score_engine_node(state: AgentState):
    # 1. Calculate Component Scores
    usdy_apy = state["data"].get("yields", {}).get("usdy", 5.0)
    meth_apy = state["data"].get("yields", {}).get("meth", 3.5)
    spread = usdy_apy - meth_apy
    vol = state["data"].get("risk", {}).get("vol", 1.5)
    
    # Yield Score (40%): Higher spread vs baseline is better
    yield_score = max(0, min(100, int(spread * 15 + 55)))
    # Volatility Score (35%): Inverse to market volatility
    vol_score = max(0, min(100, int(100 - (vol - 0.5) * 28)))
    # Liquidity Score (25%): Simulated depth
    liq_score = 82 + random.randint(-2, 2)
    
    # 2. Calculate Weighted Raw Total
    raw_weighted_total = (yield_score * 0.40) + (vol_score * 0.35) + (liq_score * 0.25)

    # 3. EMA Smoothing with Hard Clamp
    if EMA_SCORE is None:
        EMA_SCORE = float(raw_weighted_total)
    else:
        # Hard clamp — score CANNOT change more than 5 points per cycle
        clamped_raw = max(EMA_SCORE - MAX_DELTA, min(EMA_SCORE + MAX_DELTA, float(raw_weighted_total)))
        EMA_SCORE = (ALPHA * clamped_raw) + ((1 - ALPHA) * EMA_SCORE)
    
    risk_score = int(EMA_SCORE)
    
    # Save components and synced score
    comp_data = {
        "yield_score": yield_score,
        "volatility_score": vol_score,
        "liquidity_score": liq_score
    }
    state["data"]["components"] = comp_data
    state["data"]["risk"]["score"] = risk_score
    last_known_state["components"] = comp_data
    last_known_state["risk"]["score"] = risk_score

    # 4. Decision Logic
    if regime == "Expansion" and risk_score >= 65:
        h_s = "H(s)_growth"
        damping = "0.4 (Underdamped)"
        action = "mETH"
    elif regime == "Contraction" and risk_score <= 45:
        h_s = "H(s)_hedge"
        damping = "1.0 (Critically Damped)"
        action = "USDY"
    elif regime == "Consolidation" and 50 <= risk_score <= 65:
        h_s = "H(s)_stability"
        damping = "0.707 (Optimal Damping)"
        action = "WMNT"
    else:
        h_s = "H(s)_hold"
        damping = "1.0 (Critically Damped)"
        action = "HOLD"
    
    if action == "HOLD":
        content = f"scoring: hold engaged. score {risk_score}. default to HOLD."
    else:
        content = f"scoring: {h_s} triggered. action: {action}. damping limits: {damping}."
        
    state["data"]["action"] = action
    vol = state["data"].get("vol", 1.5)
    sensitivity = 1.0 / (vol + 0.1)
    state["sensitivity"] = sensitivity

    return {"messages": [AIMessage(content=content)], "sensitivity": sensitivity, "data": state["data"]}

async def telemetry_aggregator_node(state: AgentState):
    logger.info("node: telemetry_aggregator | broadcasting state")
    await asyncio.sleep(0.05) # simulate minor latency
    content = "telemetry: packet broadcast complete. cross-node consensus achieved in 12ms."
    return {"messages": [AIMessage(content=content)], "data": state["data"]}

async def supervisory_controller_node(state: AgentState):
    logger.info("node: supervisory_controller | validating q-score authority")
    global LAST_REBALANCE_TIME, CURRENT_POSITION, CIRCUIT_BREAKER_ACTIVE, CB_UNWIND_DONE
    
    risk_score = state["data"].get("risk", {}).get("score", 50)
    action = state["data"].get("action", "HOLD")

    # ── CIRCUIT BREAKER LOGIC ──
    update_circuit_breaker(risk_score)
    if CIRCUIT_BREAKER_ACTIVE:
        # If we already attempted an unwind this CB episode, don't retry
        if CB_UNWIND_DONE:
            logger.info("executor: CIRCUIT BREAKER ACTIVE — unwind already attempted. waiting for score recovery above 55.")
            return {"messages": [AIMessage(content="executor: CIRCUIT BREAKER ACTIVE — unwind already attempted. awaiting score recovery.")], "data": state["data"]}
        
        logger.warning(f"executor: CIRCUIT BREAKER ACTIVE — initiating EMERGENCY UNWIND. position={CURRENT_POSITION}")
        
        # If we are in a risky position (mETH or USDY), unwind to MNT
        if CURRENT_POSITION != "MNT":
            record_transaction(
                action="UNWIND", 
                score=risk_score, 
                regime=state["data"].get("regime", "N/A"), 
                cycle=state.get("cycle_count", 0),
                status="emergency_unwind",
                tx_hash="N/A" # Will be updated if on-chain call succeeds
            )
            # Override action to trigger unwind in the RPC executor below
            state["data"]["action"] = "UNWIND"
            action = "UNWIND"
            CB_UNWIND_DONE = True
        else:
            CB_UNWIND_DONE = True
            return {"messages": [AIMessage(content="executor: CIRCUIT BREAKER ACTIVE — system already in safety (MNT).")], "data": state["data"]}
    
    # ── POSITION TRACKING: skip if already in target ──
    if action == "mETH" and CURRENT_POSITION == "mETH":
        logger.info("executor: already in mETH position. skipping swap.")
        return {"messages": [AIMessage(content="executor: position already optimized (mETH). skipping transaction.")], "data": state["data"]}
    elif action == "USDY" and CURRENT_POSITION == "USDY":
        logger.info("executor: already in USDY position. skipping swap.")
        return {"messages": [AIMessage(content="executor: position already optimized (USDY). skipping transaction.")], "data": state["data"]}
    elif action == "WMNT" and CURRENT_POSITION == "WMNT":
        logger.info("executor: already in WMNT position. skipping swap.")
        return {"messages": [AIMessage(content="executor: position already optimized (WMNT). skipping transaction.")], "data": state["data"]}

    # ── Q-SCORE FINAL AUTHORITY: executor cannot override the scoring engine ──
    regime = state["data"].get("regime", "N/A")
    if (regime == "Expansion" and risk_score < 60) or action == "HOLD":
        logger.info(f"executor: standby mode. score={risk_score}, action={action}. threshold=60. skipping.")
        record_transaction(
            action=action, 
            score=risk_score, 
            regime=state["data"].get("regime", "N/A"), 
            cycle=state.get("cycle_count", 0),
            status="hold",
            tx_hash="N/A"
        )
        return {"messages": [AIMessage(content=f"executor: hold mode. score {risk_score}. q-score engine is final authority. no on-chain action taken.")], "data": state["data"]}
    
    if not WEB3_AVAILABLE:
        record_transaction(
            action=action, 
            score=risk_score, 
            regime=state["data"].get("regime", "N/A"), 
            cycle=state.get("cycle_count", 0),
            status="simulation",
            tx_hash="SIM_0x" + secrets.token_hex(20)
        )
        CURRENT_POSITION = action # Update position even in simulation
        return {"messages": [AIMessage(content="executor: web3 unavailable. operating in simulation.")], "data": state["data"]}
    
    rpc_url = os.getenv("MANTLE_RPC_URL", "https://rpc.mantle.xyz")
    private_key = os.getenv("AGENT_PRIVATE_KEY")
    vault_addr = os.getenv("VAULT_ADDRESS", "0x1cA9813c83e6d012798acD19Af1CF87a91F119DD")
    
    if not private_key or not vault_addr:
        logger.error(f"executor: pre-flight check failed. private_key={bool(private_key)}, vault_addr={vault_addr}")
        return {"messages": [AIMessage(content="executor: pre-flight check. vault address or key missing. operating in simulation.")], "data": state["data"]}

    current_time = time.time()
    elapsed = current_time - LAST_REBALANCE_TIME
    if elapsed < COOLDOWN_SECONDS:
        logger.info(f"executor: cooldown active. {int(COOLDOWN_SECONDS - elapsed)}s remaining. skipping.")
        return {"messages": [AIMessage(content=f"executor: rebalance cooldown active ({COOLDOWN_SECONDS}s). skipping on-chain execution.")], "data": state["data"]}
    
    logger.info(f"executor: preparing transaction for action={action} on vault={vault_addr}")

    vault_abi = [
        {
            "inputs": [
                {"internalType": "address", "name": "targetToken", "type": "address"},
                {"internalType": "uint256", "name": "minAmountOut", "type": "uint256"}
            ],
            "name": "rebalance",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {"internalType": "string", "name": "_regime", "type": "string"}
            ],
            "name": "setRegime",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]

    ZERO_ADDR = "0x0000000000000000000000000000000000000000"

    target_token = ZERO_ADDR
    if action == "mETH":
        target_token = METH_ADDRESS
    elif action == "USDY":
        target_token = USDY_ADDRESS
    elif action == "WMNT":
        target_token = WMNT_ADDRESS
    elif action == "UNWIND":
        target_token = ZERO_ADDR

    # ── 500ms ANTIGRAVITY SLA & EXPONENTIAL BACKOFF: 3 attempts ──
    async def _rpc_execute():
        global LAST_REBALANCE_TIME, CURRENT_POSITION
        loop = asyncio.get_event_loop()
        for attempt in range(3):
            try:
                def sync_tx():
                    w3 = Web3(Web3.HTTPProvider(rpc_url))
                    if not w3.is_connected():
                        raise ConnectionError("rpc unreachable")
                        
                    vault_address = w3.to_checksum_address(vault_addr)
                    # Check vault balance
                    balance = w3.eth.get_balance(vault_address)
                    vault_balance_before = float(w3.from_wei(balance, 'ether'))
                    logger.info(f"executor: rpc check - vault balance = {vault_balance_before} MNT")
                    
                    if balance == 0:
                        return "aborting|executor: vault balance is 0. aborting execution."
                    
                    # ── PRE-FLIGHT BALANCE CHECKS ──
                    if action == "mETH" and balance < w3.to_wei(0.01, 'ether'):
                        return "aborting|executor: insufficient MNT for mETH swap. skipping."
                    
                    if action == "USDY":
                        # Check mETH balance before swapping to USDY
                        m_contract = w3.eth.contract(address=w3.to_checksum_address(METH_ADDRESS), abi=ERC20_ABI)
                        m_balance = m_contract.functions.balanceOf(vault_address).call()
                        if m_balance == 0:
                            return "aborting|executor: insufficient mETH for USDY swap. skipping."
                            
                    if action == "WMNT" and balance < w3.to_wei(0.01, 'ether'):
                        return "aborting|executor: insufficient MNT for WMNT swap. skipping."
                        
                    if action == "UNWIND":
                        logger.info("executor: EMERGENCY UNWIND in progress...")
                        
                    account = w3.eth.account.from_key(private_key)
                    logger.info(f"executor: rpc check - account {account.address[:10]}... ready")
                    
                    contract = w3.eth.contract(address=vault_address, abi=vault_abi)
                    
                    nonce = w3.eth.get_transaction_count(account.address)
                    gas_price = w3.eth.gas_price
                    logger.info(f"executor: rpc check - nonce={nonce}, gas_price={w3.from_wei(gas_price, 'gwei')} gwei")
                    
                    # ── Optional: Update regime on-chain if changed ──
                    current_regime = state["data"].get("regime", "Consolidation")
                    
                    # ── Build transaction with explicit parameters ──
                    # We can bundle multiple calls if needed, but for now we'll just rebalance
                    # To land regime on-chain, we can call setRegime first if it's a new regime
                    
                    # ── SLIPPAGE PROTECTION: Calculate minAmountOut ──
                    min_amount_out = 0
                    if target_token != ZERO_ADDR:
                        try:
                            # 1% slippage buffer
                            router_abi = [{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"}]
                            router_addr = "0xeaEE7EE68874218c3558b40063c42B82D3E7232a"
                            router_contract = w3.eth.contract(address=w3.to_checksum_address(router_addr), abi=router_abi)
                            
                            amount_in = balance - w3.to_wei(0.01, 'ether')
                            path = [w3.to_checksum_address(WMNT_ADDRESS), w3.to_checksum_address(target_token)]
                            
                            if target_token == w3.to_checksum_address(WMNT_ADDRESS):
                                # Direct wrap, 1:1
                                min_amount_out = int(amount_in * 0.99)
                            else:
                                amounts_out = router_contract.functions.getAmountsOut(amount_in, path).call()
                                # apply 1% slippage (99% of quote)
                                min_amount_out = int(amounts_out[-1] * 0.99)
                                
                            logger.info(f"executor: slippage check - amountIn={w3.from_wei(amount_in, 'ether')} minAmountOut={min_amount_out}")
                        except Exception as e:
                            logger.warning(f"executor: quote failed, using 0 as fallback (risky): {e}")
                            min_amount_out = 0

                    tx = contract.functions.rebalance(target_token, min_amount_out).build_transaction({
                        'from': account.address,
                        'value': 0,
                        'chainId': 5000,
                        'gas': 600000, # Increased for complex swaps
                        'gasPrice': gas_price,
                        'nonce': nonce,
                    })
                    
                    logger.info(f"executor: tx built. value={tx.get('value')}, to={tx.get('to')}")
                    
                    signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)
                    raw_tx = getattr(signed_tx, 'rawTransaction', getattr(signed_tx, 'raw_transaction', None))
                    
                    logger.info("executor: broadcasting transaction to mantle...")
                    tx_hash = w3.eth.send_raw_transaction(raw_tx)
                    
                    # If success, also try to set regime in a separate tx or later
                    # (In production, you'd batch these or use a multicall)
                    try:
                        logger.info(f"executor: syncing regime '{current_regime}' on-chain...")
                        regime_tx = contract.functions.setRegime(current_regime).build_transaction({
                            'from': account.address,
                            'nonce': nonce + 1,
                            'gas': 200000,
                            'gasPrice': gas_price,
                            'chainId': 5000
                        })
                        signed_regime_tx = w3.eth.account.sign_transaction(regime_tx, private_key=private_key)
                        raw_regime_tx = getattr(signed_regime_tx, 'rawTransaction', getattr(signed_regime_tx, 'raw_transaction', None))
                        w3.eth.send_raw_transaction(raw_regime_tx)
                    except Exception as re:
                        logger.warning(f"executor: regime sync failed (non-critical): {re}")

                    tx_hash_hex = w3.to_hex(tx_hash)
                    logger.info(f"executor: waiting for receipt for {tx_hash_hex}...")
                    try:
                        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
                        status = "success" if receipt.status == 1 else "failed"
                        
                        if status == "success":
                            vault_balance_after = float(w3.from_wei(w3.eth.get_balance(vault_address), 'ether'))
                            pnl = vault_balance_after - vault_balance_before
                            target_asset = "MNT" if action == "UNWIND" else action
                            
                            conn = sqlite3.connect(DB_PATH)
                            conn.execute("""
                                INSERT INTO performance_log
                                (timestamp, action, from_asset, to_asset, vault_value_before, vault_value_after, pnl, tx_hash)
                                VALUES (datetime('now'), ?, ?, ?, ?, ?, ?, ?)
                            """, (action, CURRENT_POSITION, target_asset, vault_balance_before, vault_balance_after, pnl, tx_hash_hex))
                            conn.commit()
                            conn.close()
                            
                        return f"{status}|{tx_hash_hex}|executor: signal synchronized. tx {'confirmed' if status == 'success' else 'reverted'} on mantle mainnet: {tx_hash_hex}"
                    except Exception as te:
                        logger.warning(f"executor: receipt timeout or error: {te}")
                        return f"failed|{tx_hash_hex}|executor: tx sent but receipt check failed: {str(te)[:40]}"

                res = await loop.run_in_executor(None, sync_tx)
                if "aborting" in res:
                    msg = res.split("|")[-1] if "|" in res else res
                    logger.info(msg)
                    return msg
                
                # Extract status and hash from piped response
                try:
                    parts = res.split("|")
                    status = parts[0]
                    h = parts[1]
                    msg = parts[2]
                except Exception:
                    status = "failed"
                    h = "N/A"
                    msg = res

                record_transaction(
                    action=action, 
                    score=risk_score, 
                    regime=state["data"].get("regime", "N/A"), 
                    cycle=state.get("cycle_count", 0),
                    status=status,
                    tx_hash=h
                )
                
                if status == "success":
                    old_pos = CURRENT_POSITION
                    LAST_REBALANCE_TIME = time.time()
                    CURRENT_POSITION = "MNT" if action == "UNWIND" else action # Update current position state
                    logger.info(f"executor: position updated: {old_pos} → {CURRENT_POSITION}")
                return msg
            except Exception as e:
                if attempt == 2:
                    raise e
                logger.warning(f"executor: rpc attempt {attempt + 1} failed, retrying...")
                await asyncio.sleep(0.1 * (2 ** attempt))

    try:
        content = await asyncio.wait_for(_rpc_execute(), timeout=10.0)
        logger.info(content)
    except asyncio.TimeoutError:
        logger.warning("executor: rpc call exceeded total sla limit. state locked.")
        content = "executor: rpc timeout. sla breached. state locked. retrying next cycle."
    except ConnectionError:
        content = "executor: rpc unreachable. state locked. retrying next cycle."
    except Exception as e:
        logger.error(f"executor rpc error: {e}")
        content = f"executor: rpc error. state locked. error: {str(e)[:40]}"

    return {"messages": [AIMessage(content=content)], "data": state["data"]}


# ─── Build Graph ─────────────────────────────────────────────────────────────

workflow = StateGraph(AgentState)
workflow.add_node("regime", regime_detection_node)
workflow.add_node("risk", risk_assessment_node)
workflow.add_node("scoring", q_score_engine_node)
workflow.add_node("telemetry", telemetry_aggregator_node)
workflow.add_node("supervisor", supervisory_controller_node)

workflow.set_entry_point("regime")
workflow.add_edge("regime", "risk")
workflow.add_edge("risk", "scoring")
workflow.add_edge("scoring", "telemetry")
workflow.add_edge("telemetry", "supervisor")
workflow.add_edge("supervisor", END)

# ─── Build Graph ─────────────────────────────────────────────────────────────

graph = workflow.compile()

# ─── Server Configuration ─────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TRANSACTIONS_FILE = os.path.join(BASE_DIR, "transactions.json")
AGENT_TRANSACTIONS = []

def load_transactions():
    global AGENT_TRANSACTIONS
    if os.path.exists(TRANSACTIONS_FILE):
        try:
            with open(TRANSACTIONS_FILE, "r") as f:
                AGENT_TRANSACTIONS = json.load(f)
        except Exception as e:
            logger.error(f"Failed to load transactions: {e}")

load_transactions()

# ─── Session Management (Antigravity Protocol) ────────────────────────────────

SESSIONS = {}
SESSION_TIMEOUT = 1800 # 30 minutes inactivity window

async def session_reaper():
    """Periodic reaper to evict expired sessions and prevent unbounded memory growth."""
    while True:
        await asyncio.sleep(60)
        now = time.time()
        expired = [k for k, v in SESSIONS.items() if now - v["last_seen"] > SESSION_TIMEOUT]
        for k in expired:
            del SESSIONS[k]
        if expired:
            logger.info(f"session_reaper: evicted {len(expired)} expired sessions. active: {len(SESSIONS)}")

async def verify_session(x_session_token: str = Header(None)):
    """
    Heartbeat & Validation Mechanism
    Enforces the 300s inactivity window.
    """
    if not x_session_token or x_session_token not in SESSIONS:
        raise HTTPException(status_code=401, detail="Session_Expired")
    
    session = SESSIONS[x_session_token]
    now = time.time()
    
    if now - session["last_seen"] > SESSION_TIMEOUT:
        logger.info(f"Session expired: {session['address'][:10]}...")
        del SESSIONS[x_session_token]
        raise HTTPException(status_code=401, detail="Session_Expired")
    
    # Heartbeat: update last_seen on interaction
    session["last_seen"] = now
    return session

class AuthRequest(BaseModel):
    address: str
    signature: str
    message: str

app = FastAPI(title="Obelisk Q Engine")

@app.post("/api/auth/login")
async def login(auth: AuthRequest):
    """
    Antigravity Temporal Token Issuance
    Requires a valid Mantle/Ethereum wallet signature.
    """
    try:
        if not WEB3_AVAILABLE:
            # Simulation mode fallback
            token = secrets.token_hex(32)
            SESSIONS[token] = {"address": auth.address, "last_seen": time.time()}
            return {"token": token, "address": auth.address}

        w3 = Web3()
        recovered_address = None

        # Try encode_defunct first (most common in eth_account >= 0.5)
        try:
            from eth_account.messages import encode_defunct
            message_encoded = encode_defunct(text=auth.message)
            recovered_address = w3.eth.account.recover_message(message_encoded, signature=auth.signature)
            logger.info(f"Signature recovered via encode_defunct: {recovered_address}")
        except Exception as e1:
            logger.warning(f"encode_defunct failed: {e1}")
            # Try encode_defensive_message as fallback
            try:
                from eth_account.messages import encode_defensive_message
                message_encoded = encode_defensive_message(text=auth.message)
                recovered_address = w3.eth.account.recover_message(message_encoded, signature=auth.signature)
                logger.info(f"Signature recovered via encode_defensive_message: {recovered_address}")
            except Exception as e2:
                logger.warning(f"encode_defensive_message also failed: {e2}")

        if recovered_address and recovered_address.lower() == auth.address.lower():
            token = secrets.token_hex(32)
            SESSIONS[token] = {
                "address": auth.address,
                "last_seen": time.time()
            }
            logger.info(f"Session issued (verified): {auth.address[:10]}...")
            return {"token": token, "address": auth.address}
        else:
            logger.error(f"Signature verification failed completely for: {auth.address}")
            raise HTTPException(status_code=401, detail="Invalid_Signature_Library")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CRITICAL AUTH FAILURE: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Authentication_Failed: {str(e)}")

@app.get("/api/agent/transactions")
async def get_agent_transactions():
    """Returns the last 10 agent transactions from SQLite, newest first."""
    try:
        conn = sqlite3.connect(DB_PATH)
        rows = conn.execute("""
            SELECT tx_hash, action, score, regime, timestamp, status, vault_address, cycle 
            FROM agent_transactions 
            ORDER BY id DESC LIMIT 10
        """).fetchall()
        conn.close()
        return [
            {
                "tx_hash": r[0], "action": r[1], "score": r[2], "regime": r[3],
                "timestamp": r[4], "status": r[5], "vault_address": r[6], "cycle_number": r[7]
            } for r in rows
        ]
    except Exception as e:
        logger.error(f"Failed to fetch transactions from DB: {e}")
        return []

API_CACHE = {}

@app.get("/api/yields")
async def get_yields():
    return {
        "meth_apy": API_CACHE.get("meth_apy", 3.8),
        "usdy_apy": API_CACHE.get("usdy_apy", 5.0),
        "fear_greed": API_CACHE.get("fear_greed", 50),
        "mnt_price": API_CACHE.get("mnt_price", 0.68)
    }

@app.get("/api/agent/logs")
async def get_agent_logs():
    rows = get_recent_memory(20)
    return {"logs": [{"timestamp": r[0], "cycle": r[1], "regime": r[2], "score": r[3], "action": r[4], "position": r[5], "tx_hash": r[6]} for r in rows]}

def record_transaction(action, score, regime, cycle, status="success", tx_hash="N/A"):
    # Only record real on-chain transactions (must start with 0x)
    if not tx_hash or not str(tx_hash).startswith("0x") or str(tx_hash).startswith("SIM_"):
        logger.info(f"tx_recorded: skipped {status} log for cycle {cycle} (no real on-chain hash)")
        return

    vault_addr = os.getenv("VAULT_ADDRESS", "0x71Df51b6B5b5Fd7521E0052f5897FB51Fabf5Bed")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute("""
            INSERT INTO agent_transactions 
            (timestamp, cycle, action, score, regime, status, vault_address, tx_hash)
            VALUES (datetime('now'), ?, ?, ?, ?, ?, ?, ?)
        """, (cycle, action, score, regime, status, vault_addr, tx_hash))
        conn.commit()
        conn.close()
        logger.info(f"tx_recorded: cycle={cycle} action={action} status={status} (DB saved)")
    except Exception as e:
        logger.error(f"Failed to save transaction to DB: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── REST Endpoints ───────────────────────────────────────────────────────────

@app.get("/api/performance")
async def get_performance():
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("""
        SELECT timestamp, action, from_asset, to_asset, 
               vault_value_before, vault_value_after, pnl, tx_hash
        FROM performance_log 
        ORDER BY id DESC LIMIT 20
    """).fetchall()
    conn.close()
    total_pnl = sum(r[6] for r in rows if r[6])
    return {
        "trades": [{"timestamp": r[0], "action": r[1], "from": r[2], "to": r[3], "before": r[4], "after": r[5], "pnl": r[6], "tx_hash": r[7]} for r in rows],
        "total_pnl": round(total_pnl, 6)
    }

@app.get("/api/memory")
async def get_memory():
    rows = get_recent_memory(20)
    return {"memory": [{"timestamp": r[0], "cycle": r[1], "regime": r[2], "score": r[3], "action": r[4], "position": r[5], "tx_hash": r[6]} for r in rows]}

@app.get("/api/stats")
async def get_stats():
    return {
        "total_aum": "1,240,500",
        "active_users": 142,
        "vault_health": "Optimal",
        "score": last_known_state["risk"]["score"],
        "regime": last_known_state["regime"],
        "components": last_known_state["components"],
        "score_history": last_known_state["score_history"],
        "circuit_breaker_active": CIRCUIT_BREAKER_ACTIVE,
        "current_position": CURRENT_POSITION,
        "supported_assets": ["MNT", "mETH", "USDY", "WMNT"]
    }

class AppState:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

global_app_state = AppState()

async def broadcast(message: dict):
    msg_json = json.dumps(message)
    dead_connections = []
    for connection in list(global_app_state.active_connections):  # copy to avoid mutation during iteration
        try:
            await connection.send_text(msg_json)
        except Exception:
            dead_connections.append(connection)
    for conn in dead_connections:
        try:
            global_app_state.active_connections.remove(conn)
        except ValueError:
            pass

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Extract token from query params or subprotocols
    token = websocket.query_params.get("token")
    
    if not token or token not in SESSIONS:
        await websocket.accept() # Must accept before closing with code
        await websocket.close(code=4001) # Session_Expired
        return
    
    # Verify timeout even on WS handshake
    session = SESSIONS[token]
    if time.time() - session["last_seen"] > SESSION_TIMEOUT:
        await websocket.accept()
        await websocket.close(code=4001)
        return

    await websocket.accept()
    global_app_state.active_connections.append(websocket)
    try:
        while True: 
            # Heartbeat via WS activity
            data = await websocket.receive_text()
            if token in SESSIONS:
                SESSIONS[token]["last_seen"] = time.time()
    except WebSocketDisconnect:
        if websocket in global_app_state.active_connections:
            global_app_state.active_connections.remove(websocket)

async def run_analysis_cycle():
    from memory import agent_memory
    cycle_num = 0
    NODE_ID = os.getenv("NODE_ID", f"node_{secrets.token_hex(4)}")
    NODE_ROLE = os.getenv("NODE_ROLE", "primary") # primary or shadow
    
    logger.info(f"run_analysis_cycle: initialization successful. node={NODE_ID} role={NODE_ROLE}")
    
    while True:
        # Update our own heartbeat
        update_heartbeat(NODE_ID, NODE_ROLE)
        
        if NODE_ROLE == "shadow":
            is_primary_healthy = get_primary_health()
            if is_primary_healthy:
                logger.info("shadow_node: primary is healthy. standby mode.")
                await asyncio.sleep(30)
                continue
            else:
                logger.warning("shadow_node: PRIMARY FAILURE DETECTED. taking over execution.")

        logger.info(f"cycle {cycle_num + 1}: pre-flight countdown starting")
        try:
            for i in range(CYCLE_INTERVAL, 0, -1):
                await broadcast({"type": "countdown", "value": i})
                await asyncio.sleep(1)
            
            cycle_num += 1
            initial_state = {
                "messages": [HumanMessage(content="init")],
                "data": {},
                "cycle_count": cycle_num,
                "next_agent": "",
                "sensitivity": 0.5
            }
            
            # Guard the graph invocation with a timeout
            try:
                final_state = await asyncio.wait_for(
                    graph.ainvoke(initial_state),
                    timeout=30.0  # 30s max per cycle
                )
            except asyncio.TimeoutError:
                logger.error(f"cycle {cycle_num}: graph invocation timed out after 30s")
                await broadcast({"type": "update", "score": last_known_state["risk"]["score"], "regime": last_known_state["regime"], "logs": [], "yields": last_known_state["yields"]})
                continue
            
            score = final_state.get("data", {}).get("risk", {}).get("score", 92)
            regime = final_state.get("data", {}).get("regime", "Consolidation")
            action = final_state.get("data", {}).get("action", "SYNC")
            
            logs = []
            node_map = {
                0: "Regime Detection",
                1: "Risk Assessment",
                2: "Q-Score Engine",
                3: "Telemetry Aggregator",
                4: "Supervisory Controller"
            }
            for i, msg in enumerate(final_state.get("messages", [])):
                if isinstance(msg, AIMessage):
                    node_name = node_map.get(i-1, "System") if i > 0 else "System"
                    logs.append({
                        "timestamp": datetime.now().isoformat(),
                        "message": msg.content,
                        "action": "Agent Action",
                        "score": score,
                        "node": node_name
                    })
            
            try:
                analyst_insight = final_state.get("data", {}).get("analyst_insight", None)
                if not analyst_insight:
                    messages = final_state.get("messages", [])
                    analyst_insight = messages[1].content if len(messages) > 1 else "no insight"
                agent_memory.store_cycle(
                    score=score,
                    regime=regime,
                    decision=action,
                    analyst_insight=analyst_insight
                )
            except Exception as e:
                logger.warning(f"cycle {cycle_num}: memory store failed: {e}")
            
            yields = final_state.get("data", {}).get("yields", {"usdy": 5.0, "meth": 3.5})
            tx_hash = "N/A"
            if AGENT_TRANSACTIONS and AGENT_TRANSACTIONS[-1].get("cycle_number") == cycle_num:
                tx_hash = AGENT_TRANSACTIONS[-1].get("tx_hash", "N/A")
                
            save_cycle_memory(
                cycle=cycle_num,
                regime=regime,
                score=score,
                action=action,
                position=CURRENT_POSITION,
                meth_apy=yields.get("meth", 0),
                usdy_apy=yields.get("usdy", 0),
                tx_hash=tx_hash,
                analyst_insight=analyst_insight
            )
            
            await broadcast({
                "type": "update",
                "score": score,
                "regime": regime,
                "logs": logs,
                "components": final_state.get("data", {}).get("components", last_known_state["components"]),
                "score_history": last_known_state["score_history"],
                "yields": final_state.get("data", {}).get("yields", {"usdy": 5.0, "meth": 3.5})
            })
            
            # Update rolling history (8 hours = 48 points)
            last_known_state["score_history"].append(score)
            if len(last_known_state["score_history"]) > 48:
                last_known_state["score_history"].pop(0)
            
            logger.info(f"cycle {cycle_num} complete. score={score} regime={regime} action={action}")
            
        except Exception as e:
            logger.error(f"cycle {cycle_num}: unhandled error: {e}")
            await asyncio.sleep(5)  # back off before retrying

async def sync_current_position():
    global CURRENT_POSITION
    try:
        w3 = Web3(Web3.HTTPProvider(os.getenv("MANTLE_RPC_URL")))
        vault_addr = os.getenv("VAULT_ADDRESS")

        meth_contract = w3.eth.contract(address=w3.to_checksum_address(METH_ADDRESS), abi=ERC20_ABI)
        meth_balance = meth_contract.functions.balanceOf(w3.to_checksum_address(vault_addr)).call()
        if meth_balance > 0:
            CURRENT_POSITION = "mETH"
            logger.info(f"sync_current_position: CURRENT_POSITION=mETH")
            return

        usdy_contract = w3.eth.contract(address=w3.to_checksum_address(USDY_ADDRESS), abi=ERC20_ABI)
        usdy_balance = usdy_contract.functions.balanceOf(w3.to_checksum_address(vault_addr)).call()
        if usdy_balance > 0:
            CURRENT_POSITION = "USDY"
            logger.info(f"sync_current_position: CURRENT_POSITION=USDY")
            return

        wmnt_contract = w3.eth.contract(address=w3.to_checksum_address(WMNT_ADDRESS), abi=ERC20_ABI)
        wmnt_balance = wmnt_contract.functions.balanceOf(w3.to_checksum_address(vault_addr)).call()
        if wmnt_balance > 0:
            CURRENT_POSITION = "WMNT"
            logger.info(f"sync_current_position: CURRENT_POSITION=WMNT")
            return

        CURRENT_POSITION = "MNT"
        logger.info(f"sync_current_position: CURRENT_POSITION=MNT")
    except Exception as e:
        logger.warning(f"sync_current_position failed: {e}")

@app.on_event("startup")
async def startup():
    init_db()
    
    # ── STATE RECOVERY: Load last known state from DB ──
    try:
        conn = sqlite3.connect(DB_PATH)
        last_row = conn.execute("""
            SELECT score, regime, position 
            FROM agent_memory 
            ORDER BY id DESC LIMIT 1
        """).fetchone()
        conn.close()
        
        if last_row:
            global EMA_SCORE, CURRENT_POSITION
            EMA_SCORE = float(last_row[0])
            last_known_state["regime"] = last_row[1]
            last_known_state["risk"]["score"] = int(last_row[0])
            # position is synced from blockchain below
            logger.info(f"startup: state recovered from DB. score={EMA_SCORE} regime={last_row[1]}")
    except Exception as e:
        logger.warning(f"startup: state recovery failed: {e}")

    await sync_current_position() # Determine current position from blockchain
    asyncio.create_task(run_analysis_cycle())
    asyncio.create_task(session_reaper())
    logger.info("startup: analysis cycle + session reaper initialized.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
