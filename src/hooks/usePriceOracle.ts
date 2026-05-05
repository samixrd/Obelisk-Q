import { useState, useEffect } from 'react';

export interface PriceData {
  price: number;
  change24h: number;
  loading: boolean;
}

export interface PriceOracleState {
  usdy: PriceData;
  meth: PriceData;
  mnt: PriceData;
  lastUpdated: Date | null;
}

const INITIAL_STATE: PriceOracleState = {
  usdy: { price: 0, change24h: 0, loading: true },
  meth: { price: 0, change24h: 0, loading: true },
  mnt: { price: 0, change24h: 0, loading: true },
  lastUpdated: null,
};

export function usePriceOracle() {
  const [state, setState] = useState<PriceOracleState>(INITIAL_STATE);

  const fetchPrices = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ondo-us-dollar-yield,mantle-staked-ether,mantle&vs_currencies=usd&include_24hr_change=true'
      );
      const data = await response.json();

      setState({
        usdy: {
          price: data['ondo-us-dollar-yield']?.usd || 0,
          change24h: data['ondo-us-dollar-yield']?.usd_24h_change || 0,
          loading: false,
        },
        meth: {
          price: data['mantle-staked-ether']?.usd || 0,
          change24h: data['mantle-staked-ether']?.usd_24h_change || 0,
          loading: false,
        },
        mnt: {
          price: data['mantle']?.usd || 0,
          change24h: data['mantle']?.usd_24h_change || 0,
          loading: false,
        },
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      setState(prev => ({
        ...prev,
        usdy: { ...prev.usdy, loading: false },
        meth: { ...prev.meth, loading: false },
        mnt: { ...prev.mnt, loading: false },
      }));
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  return state;
}
