import { useState, useEffect } from 'react';

const TOKEN_IDS = {
  MNT: 'mantle',
  USDY: 'ondo-us-dollar-yield',
  mETH: 'mantle-staked-ether'
};

export function useTokenLogos() {
  const [logos, setLogos] = useState<{ [key: string]: string }>({
    MNT: '',
    USDY: '',
    mETH: ''
  });

  useEffect(() => {
    async function fetchLogos() {
      try {
        const results: { [key: string]: string } = {};
        
        for (const [symbol, id] of Object.entries(TOKEN_IDS)) {
          const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
          if (res.ok) {
            const data = await res.json();
            results[symbol] = data.image.small;
          }
        }
        
        setLogos(results);
      } catch (err) {
        console.error("Failed to fetch token logos:", err);
      }
    }

    fetchLogos();
  }, []);

  return logos;
}
