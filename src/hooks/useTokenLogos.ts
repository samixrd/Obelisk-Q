import { useState, useEffect } from 'react';

const TOKEN_IDS_LIST = 'mantle,ondo-us-dollar-yield,mantle-staked-ether';

// Official token logos (reliable raw URLs from TrustWallet assets)
const METH_OFFICIAL_LOGO = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa/logo.png';
const USDY_OFFICIAL_LOGO = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x96F6eF951840721AdBF46Ac996b59E0235CB985C/logo.png';
const MNT_OFFICIAL_LOGO = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x3c3a81e81dc49A522A592e7622A7E711c06bf354/logo.png';

type LogoMap = { [key: string]: string | null };

let cachedLogos: LogoMap | null = null;
let fetchPromise: Promise<LogoMap> | null = null;

export function useTokenLogos() {
  const [logos, setLogos] = useState<LogoMap>(cachedLogos || {
    MNT: null,
    USDY: null,
    mETH: null
  });

  useEffect(() => {
    if (cachedLogos) {
      setLogos(cachedLogos);
      return;
    }

    async function fetchLogos() {
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${TOKEN_IDS_LIST}`);
        if (res.ok) {
          const data = await res.json();
          const results: LogoMap = {};
          
          data.forEach((coin: any) => {
            if (coin.id === 'mantle') results.MNT = coin.image;
            if (coin.id === 'ondo-us-dollar-yield') results.USDY = coin.image;
            if (coin.id === 'mantle-staked-ether') results.mETH = coin.image || METH_OFFICIAL_LOGO;
          });
          
          return results;
        } else {
           console.warn("CoinGecko API error or rate limit. Using fallbacks.");
           return { MNT: MNT_OFFICIAL_LOGO, USDY: USDY_OFFICIAL_LOGO, mETH: METH_OFFICIAL_LOGO };
        }
      } catch (err) {
        console.warn("Token logo fetch error:", err);
        return { MNT: MNT_OFFICIAL_LOGO, USDY: USDY_OFFICIAL_LOGO, mETH: METH_OFFICIAL_LOGO };
      }
    }

    if (!fetchPromise) {
      fetchPromise = fetchLogos().then(results => {
        cachedLogos = results;
        return results;
      });
    }

    fetchPromise.then(results => {
      setLogos(prev => ({ ...prev, ...results }));
    });

  }, []);

  return logos;
}
