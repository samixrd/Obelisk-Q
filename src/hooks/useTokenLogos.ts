import { useState, useEffect } from 'react';

const TOKEN_IDS = {
  MNT: 'mantle',
  USDY: 'ondo-us-dollar-yield',
  mETH: 'mantle-staked-ether'
};

// Official Mantle mETH logo (white background/authentic)
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
        const results: { [key: string]: string | null } = { ...logos };
        
        // Fetch logos in parallel
        await Promise.all(
          Object.entries(TOKEN_IDS).map(async ([symbol, id]) => {
            if (symbol === 'mETH') {
              results[symbol] = METH_OFFICIAL_LOGO;
              return;
            }
            
            const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
            if (res.ok) {
              const data = await res.json();
              results[symbol] = data.image?.small || data.image?.large || null;
            }
          })
        );
        
        setLogos(results);
      } catch (err) {
        console.warn("Token logo fetch error:", err);
      }
    }

    fetchLogos();
  }, []);

  return logos;
}
