import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

// ── 5-Node LangGraph Architecture ──────────────────────────────────────────
type NodeStatus = 'active' | 'calculating' | 'streaming' | 'arbitrating' | 'idle';

interface LangGraphNode {
  id: string;
  label: string;
  status: NodeStatus;
  sub: string;
  lastPulse: number;
}

interface TelemetryLog {
  timestamp: string;
  node: string;
  message: string;
  score: number;
  cycle: number;
  confidence?: number;
  reasoning?: string;
}

const NODE_LABELS: Record<string, string> = {
  'regime-detection': 'Regime Detection',
  'risk-assessment': 'Risk Assessment',
  'deterministic-analyst': 'Deterministic Analyst',
  'consensus-arbitrator': 'Consensus Arbitrator',
  'q-score-engine': 'Q-Score Engine',
  'telemetry-aggregator': 'Telemetry Aggregator',
  'supervisory-controller': 'Supervisory Controller',
};

// ── Hook ────────────────────────────────────────────────────────────────────
export function useAgentWebSocket() {
  const { sessionToken, logout } = useAuth();
  const [score, setScore] = useState<number>(0);
  const [regime, setRegime] = useState<string>("Loading...");
  const [countdown, setCountdown] = useState<number>(10);
  const [lastMessage, setLastMessage] = useState<string>("Antigravity Protocol online — 7-node LangGraph active");
  const [liveYields, setLiveYields] = useState({ usdy: 5.1, meth: 3.6 });
  const [livePrices, setLivePrices] = useState({ usdy: 1.00, meth: 3450.20 });
  const [agentLogs, setAgentLogs] = useState<TelemetryLog[]>([]);
  const [circuitBreakerActive, setCircuitBreakerActive] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<string>("MNT");
  const [components, setComponents] = useState({ yield_score: 75, volatility_score: 70, liquidity_score: 85 });
  const [scoreHistory, setScoreHistory] = useState<number[]>([90, 89, 91, 90, 92, 90, 88, 87, 89, 90, 91, 90, 89, 90, 92, 91, 90, 89, 88, 90]);
  const [nodes, setNodes] = useState<LangGraphNode[]>([
    { id: 'regime-detection',      label: 'Regime Detection',      status: 'active',      sub: 'Market State Analysis',    lastPulse: Date.now() },
    { id: 'risk-assessment',       label: 'Risk Assessment',       status: 'active',      sub: 'Exposure Calculation',     lastPulse: Date.now() },
    { id: 'deterministic-analyst', label: 'Deterministic Analyst', status: 'calculating', sub: 'Pure Math Validation',     lastPulse: Date.now() },
    { id: 'consensus-arbitrator',  label: 'Consensus Arbitrator',  status: 'arbitrating', sub: 'Safety Bias Control',      lastPulse: Date.now() },
    { id: 'q-score-engine',        label: 'Q-Score Engine',        status: 'calculating', sub: 'Confidence Scoring',       lastPulse: Date.now() },
    { id: 'telemetry-aggregator',  label: 'Telemetry Aggregator',  status: 'streaming',   sub: 'Live Feedback Loop',       lastPulse: Date.now() },
    { id: 'supervisory-controller',label: 'Supervisory Controller',status: 'active',      sub: 'Node Arbitration',         lastPulse: Date.now() },
  ]);

  const cycleRef = useRef(1);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectedRef = useRef(false);

  // Remove autonomous telemetry engine functions to ensure only real data is used

  // ── Immediate data fetch on mount ──
  const fetchStats = async (token: string) => {
    try {
      const statsRes = await fetch('/api/stats', {
        headers: { 'x-session-token': token }
      });
      if (statsRes.ok) {
        const data = await statsRes.json();
        if (typeof data.score === 'number') setScore(data.score);
        if (typeof data.regime === 'string') setRegime(data.regime);
        if (typeof data.circuit_breaker_active === 'boolean') setCircuitBreakerActive(data.circuit_breaker_active);
        if (data.current_position) setCurrentPosition(data.current_position);
        if (data.components) setComponents(data.components);
        if (data.score_history) setScoreHistory(data.score_history);
      }
    } catch (err) {
      console.warn("Polling /api/stats failed:", err);
    }
  };

  const fetchLogs = async (token: string) => {
    try {
      const logsRes = await fetch('/api/agent/logs', {
        headers: { 'x-session-token': token }
      });
      if (logsRes.ok) {
        const data = await logsRes.json();
        const logsData = data.logs || data;
        if (Array.isArray(logsData) && logsData.length > 0) {
          const mapped = logsData.map((l: any) => ({
            timestamp: l.timestamp,
            node: l.node || (l.action === 'rebalance' ? 'Executor Node' : 'Supervisory Controller'),
            message: l.analyst_insight || l.message || `Cycle ${l.cycle}: ${l.regime} regime — ${l.action || 'HOLD'} confirmed.`,
            score: l.score,
            cycle: l.cycle,
            action: l.action,
            tx_hash: l.tx_hash,
            confidence: l.confidence,
            reasoning: l.reasoning
          }));
          setAgentLogs(mapped);
        }
      }
    } catch (err) {
      console.warn("Polling /api/agent/logs failed:", err);
    }
  };

  useEffect(() => {
    if (!sessionToken) return;

    // ── Fetch data IMMEDIATELY on mount ──
    fetchStats(sessionToken);
    fetchLogs(sessionToken);

    // ── WebSocket: derive URL from page origin ──
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = (import.meta as any).env?.VITE_WS_URL || `${wsProto}//${window.location.host}/ws`;

    const connectWs = () => {
      try {
        const urlWithToken = `${wsUrl}${wsUrl.includes('?') ? '&' : '?'}token=${sessionToken}`;
        wsRef.current = new WebSocket(urlWithToken);

        const timeout = setTimeout(() => {
          if (!connectedRef.current) {
            wsRef.current?.close();
            console.warn("WebSocket connection timed out — polling fallback active");
          }
        }, 3000);

        wsRef.current.onopen = () => {
          connectedRef.current = true;
          clearTimeout(timeout);
          setLastMessage("Connected to Obelisk Q backend — live telemetry active");

          heartbeatRef.current = setInterval(() => {
            setNodes(prev => prev.map(n => ({ ...n, lastPulse: Date.now() })));
          }, 1000);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'countdown') {
              setCountdown(data.value ?? 10);
            } else if (data.type === 'update' || data.type === 'init') {
              if (data.score) setScore(data.score);
              if (data.regime) setRegime(data.regime);
              if (data.circuit_breaker_active !== undefined) setCircuitBreakerActive(data.circuit_breaker_active);
              if (data.current_position) setCurrentPosition(data.current_position);
              if (data.message) setLastMessage(data.message);
              if (data.yields) setLiveYields(data.yields);
              if (data.prices) setLivePrices(data.prices);
              if (data.components) setComponents(data.components);
              if (data.score_history) setScoreHistory(data.score_history);
              if (data.logs) {
                const mapped = data.logs.map((l: any) => ({
                  ...l,
                  node: l.node || 'Supervisory Controller',
                  cycle: cycleRef.current++,
                }));
                setAgentLogs(prev => [...mapped, ...prev].slice(0, 50));
              }
            }
          } catch { /* malformed message */ }
        };

        wsRef.current.onclose = (event) => {
          connectedRef.current = false;
          if (event.code === 4001) {
            logout();
            return;
          }
        };

        wsRef.current.onerror = () => {
          // Silently fall back to polling
        };

      } catch {
        console.error("WebSocket initialization failed");
      }
    };

    connectWs();

    // ── Polling: fetch stats + logs every 10s via relative URLs (Vercel proxy) ──
    const statsInterval = setInterval(() => {
      if (!sessionToken) return;
      fetchStats(sessionToken);
      fetchLogs(sessionToken);
    }, 10000);

    return () => {
      wsRef.current?.close();
      clearInterval(statsInterval);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [sessionToken, logout]);

  return { score, regime, circuitBreakerActive, currentPosition, countdown, lastMessage, liveYields, livePrices, agentLogs, nodes, components, scoreHistory };
}
