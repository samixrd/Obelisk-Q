import operator
import json
import random
import asyncio
from typing import Annotated, List, TypedDict, Union, Literal

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_openai import ChatOpenAI # Can point to Ollama local endpoint

# ─── Configuration ────────────────────────────────────────────────────────────

app = FastAPI(title="Obelisk Q Multi-Agent Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration for Ollama / Local LLM
# User can set VITE_LLM_API_BASE to http://localhost:11434/v1
OLLAMA_BASE = "http://localhost:11434/v1" 

# ─── Multi-Agent Graph State ──────────────────────────────────────────────────

class AgentState(TypedDict):
    # The list of messages in the conversation
    messages: Annotated[List[BaseMessage], operator.add]
    # The current supervisor decision
    next_agent: str
    # Shared data pool
    data: dict
    # Analysis cycle metadata
    cycle_count: int

# ─── Agent Node Implementations ────────────────────────────────────────────────

def rwa_analyst_node(state: AgentState):
    print("--- RWA ANALYST ---")
    # Real logic: Fetch USDY yield, price data, and treasury spreads
    yield_data = {"usdy": 5.1, "meth": 3.4}
    state["data"]["yields"] = yield_data
    
    msg = AIMessage(content=f"RWA Yield Scan Complete: USDY at {yield_data['usdy']}% provides superior risk-adjusted floor.")
    return {"messages": [msg], "data": state["data"]}

def risk_manager_node(state: AgentState):
    print("--- RISK & COMPLIANCE ---")
    # Real logic: Concentration checks, volatility sigma calculation
    vol = 1.4
    risk_score = 42
    state["data"]["risk"] = {"vol": vol, "score": risk_score}
    
    msg = AIMessage(content=f"Compliance Check: Portfolio within 45% concentration cap. Risk score stable at {risk_score}.")
    return {"messages": [msg], "data": state["data"]}

def researcher_node(state: AgentState):
    print("--- RESEARCHER ---")
    # Real logic: News search, Fed rate monitoring
    msg = AIMessage(content="Market Sentiment: Fed rates holding steady. Favorable environment for Treasury-backed RWA.")
    return {"messages": [msg]}

def portfolio_tracker_node(state: AgentState):
    print("--- PORTFOLIO TRACKER ---")
    # Real logic: Performance calculations
    state["data"]["perf"] = {"ytd": 14.82, "sharpe": 2.41}
    msg = AIMessage(content="Portfolio Audit: Sharpe Ratio maintained at 2.41. All systems performing as expected.")
    return {"messages": [msg], "data": state["data"]}

def executor_node(state: AgentState):
    print("--- EXECUTOR ---")
    # Real logic: Building Mantle Transaction
    msg = AIMessage(content="Execution Signal: Conditions met. Maintaining current allocation to USDY/mETH.")
    return {"messages": [msg]}

def supervisor_node(state: AgentState):
    print("--- SUPERVISOR (BRAIN) ---")
    # This acts as the router. In a real scenario, this uses an LLM to decide.
    # Here we simulate the logic flow: Analyst -> Risk -> Portfolio -> Executor
    
    messages = state.get("messages", [])
    if not messages:
        return {"next_agent": "rwa_analyst"}
    
    last_msg = messages[-1].content
    if "Yield Scan" in last_msg:
        return {"next_agent": "risk_manager"}
    if "Compliance Check" in last_msg:
        return {"next_agent": "portfolio_tracker"}
    if "Portfolio Audit" in last_msg:
        return {"next_agent": "executor"}
    
    return {"next_agent": END}

# ─── Build Graph ─────────────────────────────────────────────────────────────

workflow = StateGraph(AgentState)

workflow.add_node("rwa_analyst", rwa_analyst_node)
workflow.add_node("risk_manager", risk_manager_node)
workflow.add_node("researcher", researcher_node)
workflow.add_node("portfolio_tracker", portfolio_tracker_node)
workflow.add_node("executor", executor_node)

# Entry point
workflow.set_entry_point("rwa_analyst")

# Simple linear routing for the demo/re-architecture
workflow.add_edge("rwa_analyst", "risk_manager")
workflow.add_edge("risk_manager", "portfolio_tracker")
workflow.add_edge("portfolio_tracker", "executor")
workflow.add_edge("executor", END)

graph = workflow.compile()

# ─── App State & WebSocket ────────────────────────────────────────────────────

class AppState:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.last_results = {}

global_app_state = AppState()

async def broadcast(message: dict):
    msg_json = json.dumps(message)
    for connection in global_app_state.active_connections:
        try:
            await connection.send_text(msg_json)
        except:
            global_app_state.active_connections.remove(connection)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    global_app_state.active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        global_app_state.active_connections.remove(websocket)

async def run_analysis_cycle():
    from backend.memory import agent_memory
    
    while True:
        # Start Countdown
        for i in range(10, 0, -1):
            await broadcast({"type": "countdown", "value": i})
            await asyncio.sleep(1)
        
        print("\n=== STARTING AGENTIC ANALYSIS CYCLE ===")
        # Run LangGraph
        initial_state = {
            "messages": [HumanMessage(content="Start Analysis Cycle")],
            "data": {},
            "cycle_count": 0,
            "next_agent": ""
        }
        
        final_state = await graph.ainvoke(initial_state)
        
        # Extract messages for the UI feed
        logs = []
        analyst_insight = ""
        for msg in final_state["messages"]:
            if isinstance(msg, AIMessage):
                logs.append({
                    "timestamp": datetime.now().isoformat(),
                    "message": msg.content,
                    "action": "Agent Action",
                    "score": random.randint(85, 99)
                })
                if "Yield Scan" in msg.content:
                    analyst_insight = msg.content
        
        # ─── Store in Long-term Memory ───
        current_score = final_state["data"].get("risk", {}).get("score", 92)
        agent_memory.store_cycle(
            score=current_score,
            regime="Stable",
            decision=final_state.get("next_agent", "END"),
            analyst_insight=analyst_insight
        )
        
        # Broadcast full update
        await broadcast({
            "type": "update",
            "score": current_score,
            "regime": "Stable",
            "logs": logs,
            "yields": final_state["data"].get("yields", {"usdy": 5.0, "meth": 3.5}),
            "metrics": final_state["data"].get("perf", {"ytd": 14.82, "sharpe": 2.41})
        })

@app.on_event("startup")
async def startup():
    from datetime import datetime
    global datetime
    asyncio.create_task(run_analysis_cycle())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
