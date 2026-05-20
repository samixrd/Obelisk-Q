/**
 * useAgentData — Single source of truth for all agent telemetry.
 *
 * This context wraps useAgentWebSocket() in a singleton provider so that
 * every component in the tree reads the SAME score, regime, and position.
 * No more conflicting numbers across tabs.
 */

import { createContext, useContext, ReactNode } from "react";
import { useAgentWebSocket } from "@/hooks/useAgentWebSocket";

interface AgentData {
  score: number;
  regime: string;
  circuitBreakerActive: boolean;
  currentPosition: string;
  countdown: number;
  lastMessage: string;
  liveYields: { usdy: number; meth: number };
  livePrices: { usdy: number; meth: number };
  agentLogs: Array<{
    timestamp: string;
    node: string;
    message: string;
    score: number;
    cycle: number;
    confidence?: number;
    reasoning?: string;
  }>;
  nodes: Array<{
    id: string;
    label: string;
    status: string;
    sub: string;
    lastPulse: number;
  }>;
  components: {
    yield_score: number;
    volatility_score: number;
    liquidity_score: number;
  };
  scoreHistory: number[];
  zkMl: {
    enabled: boolean;
    verifier_address: string;
    last_zk_proof: any;
  };
}

const AgentDataContext = createContext<AgentData | null>(null);

export function AgentDataProvider({ children }: { children: ReactNode }) {
  // Single WebSocket/telemetry instance for the entire app
  const data = useAgentWebSocket();

  return (
    <AgentDataContext.Provider value={data}>
      {children}
    </AgentDataContext.Provider>
  );
}

export function useAgentData(): AgentData {
  const ctx = useContext(AgentDataContext);
  if (!ctx) {
    throw new Error("useAgentData must be used within AgentDataProvider");
  }
  return ctx;
}
