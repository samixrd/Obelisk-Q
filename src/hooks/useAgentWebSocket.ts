import { useState, useEffect, useRef } from 'react';

interface WSMessage {
  type: 'init' | 'update' | 'countdown';
  score?: number;
  regime?: string;
  decision?: string;
  message?: string;
  value?: number;
  yields?: { usdy: number; meth: number };
  prices?: { usdy: number; meth: number };
}

export function useAgentWebSocket() {
  const [score, setScore] = useState<number>(98);
  const [regime, setRegime] = useState<string>("Stable");
  const [countdown, setCountdown] = useState<number>(10);
  const [lastMessage, setLastMessage] = useState<string>("Initializing connectivity...");
  const [liveYields, setLiveYields] = useState({ usdy: 5.0, meth: 3.5 });
  const [livePrices, setLivePrices] = useState({ usdy: 1.00, meth: 3450.20 });
  
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      const url = (import.meta as any).env?.VITE_WS_URL ?? "ws://localhost:8000/ws";
      ws.current = new WebSocket(url);

      ws.current.onmessage = (event) => {
        const data: WSMessage = JSON.parse(event.data);
        
        if (data.type === 'countdown') {
          setCountdown(data.value ?? 10);
        } else if (data.type === 'update' || data.type === 'init') {
          if (data.score) setScore(data.score);
          if (data.regime) setRegime(data.regime);
          if (data.message) setLastMessage(data.message);
          if (data.yields) setLiveYields(data.yields);
          if (data.prices) setLivePrices(data.prices);
        }
      };

      ws.current.onclose = () => {
        console.warn("WebSocket disconnected. Retrying in 5s...");
        setTimeout(connect, 5000);
      };
    };

    connect();
    return () => ws.current?.close();
  }, []);

  return { score, regime, countdown, lastMessage, liveYields, livePrices };
}
