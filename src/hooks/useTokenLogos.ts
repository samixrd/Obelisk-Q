import { useState, useEffect } from 'react';

// Reliable TrustWallet URLs for MNT and USDY
const MNT_OFFICIAL_LOGO = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x3c3a81e81dc49A522A592e7622A7E711c06bf354/logo.png';
const USDY_OFFICIAL_LOGO = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x96F6eF951840721AdBF46Ac996b59E0235CB985C/logo.png';

// Custom high-fidelity SVG Data URI for mETH (Mantle Green + ETH Diamond)
const METH_OFFICIAL_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2300D395' /%3E%3Cstop offset='100%25' stop-color='%2322C55E' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='400' rx='200' fill='url(%23g)' /%3E%3Cpath d='M200 60 L100 220 L200 280 L300 220 Z' fill='%23ffffff' opacity='0.9'/%3E%3Cpath d='M200 280 L100 220 L200 340 L300 220 Z' fill='%23ffffff' opacity='0.6'/%3E%3C/svg%3E";

type LogoMap = { [key: string]: string | null };

export function useTokenLogos() {
  const [logos, setLogos] = useState<LogoMap>({
    MNT: MNT_OFFICIAL_LOGO,
    USDY: USDY_OFFICIAL_LOGO,
    mETH: METH_OFFICIAL_LOGO
  });

  return logos;
}
