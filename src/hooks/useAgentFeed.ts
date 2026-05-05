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

const MOCK_MESSAGES = [
  { action: "scan" as AgentAction, message: "Market scanned · no action needed" },
  { action: "hold" as AgentAction, message: "Score above threshold · holding" },
  { action: "scan" as AgentAction, message: "Volatility check passed" },
  { action: "rebalance" as AgentAction, message: "Rebalance signal · rotating to mETH" },
  { action: "warn" as AgentAction, message: "Score approaching threshold" },
  { action: "circuit_breaker" as AgentAction, message: "High volatility detected · circuit breaker fired" },
];

export function useAgentFeed() {
  const [logs, setLogs] = useState<FeedEntry[]>([]);
  const [stats, setStats] = useState<AgentStats>({
    totalScans: 142,
    actionsTaken: 2,
    lastActionAt: new Date(Date.now() - 22 * 60000),
  });
  const logsRef = useRef<FeedEntry[]>([]);

  const addEntry = (entry: FeedEntry) => {
    const newLogs = [entry, ...logsRef.current].slice(0, 50);
    logsRef.current = newLogs;
    setLogs(newLogs);

    // Update stats
    setStats(prev => {
      const isAction = entry.action === "rebalance" || entry.action === "circuit_breaker";
      return {
        totalScans: prev.totalScans + 1,
        actionsTaken: isAction ? prev.actionsTaken + 1 : prev.actionsTaken,
        lastActionAt: isAction ? entry.timestamp : prev.lastActionAt,
      };
    });
  };

  const fetchStatus = async () => {
    try {
      // In a real app, this would be:
      // const res = await fetch('/api/agent/status');
      // const data = await res.json();
      // For now, we simulate the agent activity
      
      const mockIdx = Math.floor(Math.random() * MOCK_MESSAGES.length);
      const mock = MOCK_MESSAGES[mockIdx];
      const score = 60 + Math.floor(Math.random() * 38);
      
      const newEntry: FeedEntry = {
        timestamp: new Date(),
        action: mock.action,
        score,
        regime: Math.random() > 0.8 ? "high_volatility" : "stable",
        threshold: 75,
        message: mock.message,
        txHash: mock.action === "rebalance" ? "0x" + Math.random().toString(16).slice(2, 10) + "..." : null,
      };

      addEntry(newEntry);
    } catch (err) {
      console.error("Failed to poll agent status:", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStatus();
    
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return { logs, stats };
}
