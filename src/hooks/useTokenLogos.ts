import { useState, useEffect } from 'react';

const TOKEN_IDS = {
  MNT: 'mantle',
  USDY: 'ondo-us-dollar-yield',
  mETH: 'mantle-staked-ether'
};

// High-performance CDN fallbacks (Trust Wallet / CoinGecko direct)
const FALLBACK_LOGOS = {
  MNT: 'https://assets.coingecko.com/coins/images/30980/small/token-logo.png',
  USDY: 'https://assets.coingecko.com/coins/images/31123/small/ondo-us-dollar-yield.png',
  mETH: 'https://assets.coingecko.com/coins/images/33010/small/mantle-staked-ether.png'
};

export function useTokenLogos() {
  const [logos, setLogos] = useState<{ [key: string]: string }>(() => {
    // Try to load from localStorage on init for instant UI
    try {
      const cached = localStorage.getItem('obelisk_token_logos');
      return cached ? JSON.parse(cached) : FALLBACK_LOGOS;
    } catch {
      return FALLBACK_LOGOS;
    }
  });

  useEffect(() => {
    async function fetchLogos() {
      try {
        const results: { [key: string]: string } = { ...logos };
        let updated = false;

        for (const [symbol, id] of Object.entries(TOKEN_IDS)) {
          // Only fetch if not already cached/fallback is present but we want the freshest
          const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
          if (res.ok) {
            const data = await res.json();
            const url = data.image.small;
            if (results[symbol] !== url) {
              results[symbol] = url;
              updated = true;
            }
          }
        }
        
        if (updated) {
          setLogos(results);
          localStorage.setItem('obelisk_token_logos', JSON.stringify(results));
        }
      } catch (err) {
        console.warn("Failed to fetch fresh logos, using fallbacks:", err);
      }
    }

    fetchLogos();
  }, []);

  return logos;
}
