import { useState, useEffect } from 'react';

export interface YieldInfo {
  apy: number;
  loading: boolean;
  lastUpdated: Date | null;
  trend7d?: number | null;
}

export interface YieldData {
  usdy: YieldInfo;
  meth: YieldInfo;
}

const FALLBACK_USDY = 5.0;
const FALLBACK_METH = 3.5;
const API_BASE = (import.meta as any).env?.VITE_SCORING_API_URL ?? "http://localhost:8000";

export function useYieldData(): YieldData {
  const [data, setData] = useState<YieldData>({
    usdy: { apy: FALLBACK_USDY, loading: true, lastUpdated: null },
    meth: { apy: FALLBACK_METH, loading: true, lastUpdated: null },
  });

  const fetchYields = async () => {
    try {
      // 1. Try custom backend first for the "Real" AI-curated rates
      const backendRes = await fetch(`${API_BASE}/api/yields`);
      if (backendRes.ok) {
        const bData = await backendRes.json();
        setData({
          usdy: {
            apy: bData.usdy.apy,
            loading: false,
            lastUpdated: new Date(bData.timestamp),
            trend7d: bData.usdy.change_24h
          },
          meth: {
            apy: bData.meth.apy,
            loading: false,
            lastUpdated: new Date(bData.timestamp),
            trend7d: bData.meth.change_24h
          }
        });
        return;
      }

      // 2. Fallback to DefiLlama
      const response = await fetch('https://yields.llama.fi/pools');
      const json = await response.json();
      
      if (json.status === 'success' && Array.isArray(json.data)) {
        const pools = json.data;
        const usdyPool = pools.find((p: any) => p.project === 'ondo-finance' && p.chain === 'Mantle');
        const methPool = pools.find((p: any) => p.project === 'mantle-lsp' || p.symbol === 'mETH');

        setData({
          usdy: {
            apy: usdyPool ? usdyPool.apy : FALLBACK_USDY,
            loading: false,
            lastUpdated: new Date(),
            trend7d: usdyPool ? usdyPool.apyPct1D : null,
          },
          meth: {
            apy: methPool ? methPool.apy : FALLBACK_METH,
            loading: false,
            lastUpdated: new Date(),
            trend7d: methPool ? methPool.apyPct1D : null,
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch yield data:', error);
      setData(prev => ({
        usdy: { ...prev.usdy, loading: false },
        meth: { ...prev.meth, loading: false },
      }));
    }
  };

  useEffect(() => {
    fetchYields();
    const interval = setInterval(fetchYields, 30000); // More frequent updates for "Real" feel
    return () => clearInterval(interval);
  }, []);

  return data;
}
