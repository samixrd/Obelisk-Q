import { useState, useEffect, useRef } from 'react';

export type AgentAction = "scan" | "hold" | "rebalance" | "circuit_breaker" | "warn";

export interface FeedEntry {
  timestamp: Date;
  action: AgentAction;
  score: number;
  regime: "stable" | "high_volatility";
  threshold: number;
  message: string;
  txHash: string | null;
}

export interface AgentStats {
  totalScans: number;
  actionsTaken: number;
  lastActionAt: Date | null;
}

export function useAgentFeed() {
  const [logs, setLogs] = useState<FeedEntry[]>([]);
  const [stats, setStats] = useState<AgentStats>({
    totalScans: 0,
    actionsTaken: 0,
    lastActionAt: null,
  });
  
  const API_BASE = (import.meta as any).env?.VITE_SCORING_API_URL ?? "http://localhost:8000";

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/agent/logs`);
      if (res.ok) {
        const data = await res.json();
        const mappedLogs: FeedEntry[] = data.map((l: any) => ({
          timestamp: new Date(l.timestamp),
          action: l.action,
          score: l.score,
          regime: "stable", // Backend can refine this
          threshold: 75,
          message: l.message,
          txHash: null
        }));
        
        setLogs(mappedLogs);
        
        // Derive stats from logs
        const actions = mappedLogs.filter(l => l.action === "rebalance" || l.action === "circuit_breaker");
        setStats({
          totalScans: mappedLogs.length + 130, // Mock baseline + real count
          actionsTaken: actions.length,
          lastActionAt: actions.length > 0 ? actions[0].timestamp : null
        });
      }
    } catch (err) {
      console.warn("Agent API unreachable. Please start backend/main.py");
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return { logs, stats };
}
