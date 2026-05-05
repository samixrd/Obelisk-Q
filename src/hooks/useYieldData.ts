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

export function useYieldData(): YieldData {
  const [data, setData] = useState<YieldData>({
    usdy: { apy: FALLBACK_USDY, loading: true, lastUpdated: null },
    meth: { apy: FALLBACK_METH, loading: true, lastUpdated: null },
  });

  const fetchYields = async () => {
    try {
      const response = await fetch('https://yields.llama.fi/pools');
      const json = await response.json();
      
      if (json.status === 'success' && Array.isArray(json.data)) {
        const pools = json.data;
        
        // Find USDY on Mantle
        // Filter by project "ondo-finance", chain "Mantle"
        const usdyPool = pools.find((p: any) => 
          p.project === 'ondo-finance' && p.chain === 'Mantle'
        );

        // Find mETH
        // Filter by project "mantle-lsp" or symbol "mETH"
        const methPool = pools.find((p: any) => 
          p.project === 'mantle-lsp' || p.symbol === 'mETH'
        );

        setData({
          usdy: {
            apy: usdyPool ? usdyPool.apy : FALLBACK_USDY,
            loading: false,
            lastUpdated: new Date(),
            trend7d: usdyPool ? usdyPool.apyPct1D : null, // 1D trend as proxy or check if 7D exists
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
    const interval = setInterval(fetchYields, 60000);
    return () => clearInterval(interval);
  }, []);

  return data;
}
