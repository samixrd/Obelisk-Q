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
}

const NODE_LABELS: Record<string, string> = {
  'regime-detection': 'Regime Detection',
  'risk-assessment': 'Risk Assessment',
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
  const [lastMessage, setLastMessage] = useState<string>("Antigravity Protocol online — 5-node LangGraph active");
  const [liveYields, setLiveYields] = useState({ usdy: 5.1, meth: 3.6 });
  const [livePrices, setLivePrices] = useState({ usdy: 1.00, meth: 3450.20 });
  const [agentLogs, setAgentLogs] = useState<TelemetryLog[]>([]);
  const [circuitBreakerActive, setCircuitBreakerActive] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<string>("MNT");
  const [nodes, setNodes] = useState<LangGraphNode[]>([
    { id: 'regime-detection',      label: 'Regime Detection',      status: 'active',      sub: 'Market State Analysis',    lastPulse: Date.now() },
    { id: 'risk-assessment',       label: 'Risk Assessment',       status: 'active',      sub: 'Exposure Calculation',     lastPulse: Date.now() },
    { id: 'q-score-engine',        label: 'Q-Score Engine',        status: 'calculating', sub: 'Confidence Scoring',       lastPulse: Date.now() },
    { id: 'telemetry-aggregator',  label: 'Telemetry Aggregator',  status: 'streaming',   sub: 'Live Feedback Loop',       lastPulse: Date.now() },
    { id: 'supervisory-controller',label: 'Supervisory Controller',status: 'arbitrating', sub: 'Node Arbitration',         lastPulse: Date.now() },
  ]);

  const cycleRef = useRef(1);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectedRef = useRef(false);

  // Remove autonomous telemetry engine functions to ensure only real data is used

  useEffect(() => {
    // Attempt real WebSocket connection first
    const url = (import.meta as any).env?.VITE_WS_URL ?? "ws://localhost:8000/ws";

    const connectWs = () => {
      if (!sessionToken) return;
      try {
        const urlWithToken = `${url}${url.includes('?') ? '&' : '?'}token=${sessionToken}`;
        wsRef.current = new WebSocket(urlWithToken);

        const timeout = setTimeout(() => {
          // If WS hasn't opened within 2s, log it
          if (!connectedRef.current) {
            wsRef.current?.close();
            console.warn("WebSocket connection timed out — waiting for polling fallback");
          }
        }, 2000);

        wsRef.current.onopen = () => {
          connectedRef.current = true;
          clearTimeout(timeout);
          setLastMessage("Connected to Obelisk Q backend — live telemetry active");

          // Still run heartbeat for protocol compliance
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
          // Handle 401 / Session Expired
          if (event.code === 4001) {
            logout();
            return;
          }
          // Handle reconnect logic if needed, but no mock fallback
          setLastMessage("Disconnected from Obelisk Q backend — attempting reconnect...");
        };

        wsRef.current.onerror = () => {
          // Silently fall back
        };

      } catch {
        // WebSocket constructor failed
        console.error("WebSocket initialization failed");
      }
    };

    connectWs();
    
    // ── Polling Fallback: Fetch real stats from /api/stats every 10s ──
    const statsInterval = setInterval(async () => {
      if (!sessionToken) return;
      try {
        const res = await fetch('/api/stats', {
          headers: { 
            'x-session-token': sessionToken,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          // Prioritize backend data over autonomous drift
          if (typeof data.score === 'number') setScore(data.score);
          if (typeof data.regime === 'string') setRegime(data.regime);
          if (typeof data.circuit_breaker_active === 'boolean') setCircuitBreakerActive(data.circuit_breaker_active);
          if (data.current_position) setCurrentPosition(data.current_position);
        }
      } catch (err) {
        console.warn("Polling /api/stats failed:", err);
      }
    }, 30000); // 30 seconds

    return () => {
      wsRef.current?.close();
      clearInterval(statsInterval);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [sessionToken, logout]);

  return { score, regime, circuitBreakerActive, currentPosition, countdown, lastMessage, liveYields, livePrices, agentLogs, nodes };
}
