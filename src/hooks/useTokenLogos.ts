import { useState, useEffect } from 'react';

const TOKEN_IDS_LIST = 'mantle,ondo-us-dollar-yield,mantle-staked-ether';

// Official Mantle mETH logo (white background/authentic) fallback
const METH_OFFICIAL_LOGO = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa/logo.png';

export function useTokenLogos() {
  const [logos, setLogos] = useState<{ [key: string]: string | null }>({
    MNT: null,
    USDY: null,
    mETH: null
  });

  useEffect(() => {
    async function fetchLogos() {
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${TOKEN_IDS_LIST}`);
        if (res.ok) {
          const data = await res.json();
          const results: { [key: string]: string | null } = {};
          
          data.forEach((coin: any) => {
            if (coin.id === 'mantle') results.MNT = coin.image;
            if (coin.id === 'ondo-us-dollar-yield') results.USDY = coin.image;
            if (coin.id === 'mantle-staked-ether') results.mETH = coin.image || METH_OFFICIAL_LOGO;
          });
          
          // Ensure we don't overwrite with null if something was missing
          setLogos(prev => ({ ...prev, ...results }));
        } else if (res.status === 429) {
          console.warn("CoinGecko Rate Limit hit. Using fallbacks.");
        }
      } catch (err) {
        console.warn("Token logo fetch error:", err);
      }
    }

    fetchLogos();
  }, []);

  return logos;
}
