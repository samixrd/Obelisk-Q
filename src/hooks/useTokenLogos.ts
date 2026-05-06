import { useState, useEffect } from 'react';

const TOKEN_IDS = {
  MNT: 'mantle',
  USDY: 'ondo-us-dollar-yield',
  mETH: 'mantle-staked-ether'
};

export function useTokenLogos() {
  const [logos, setLogos] = useState<{ [key: string]: string | null }>({
    MNT: null,
    USDY: null,
    mETH: null
  });

  useEffect(() => {
    async function fetchLogos() {
      try {
        const results: { [key: string]: string | null } = { ...logos };
        
        // Fetch all logos in parallel for speed
        await Promise.all(
          Object.entries(TOKEN_IDS).map(async ([symbol, id]) => {
            const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
            if (res.ok) {
              const data = await res.json();
              results[symbol] = data.image?.small || data.image?.large || null;
            }
          })
        );
        
        setLogos(results);
      } catch (err) {
        console.warn("CoinGecko API error, retrying in 5s...");
        setTimeout(fetchLogos, 5000);
      }
    }

    fetchLogos();
  }, []);

  return logos;
}
