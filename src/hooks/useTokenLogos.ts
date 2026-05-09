import { useState, useEffect } from 'react';

// Reliable TrustWallet URLs for MNT and USDY
const MNT_OFFICIAL_LOGO = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x3c3a81e81dc49A522A592e7622A7E711c06bf354/logo.png';
const USDY_OFFICIAL_LOGO = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x96F6eF951840721AdBF46Ac996b59E0235CB985C/logo.png';

// Custom high-fidelity SVG Data URI for mETH (Structurally Accurate Red Crystal)
const METH_OFFICIAL_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23ffffff' /%3E%3Cpolygon points='50,15 25,46 50,56' fill='%23F43F5E' /%3E%3Cpolygon points='50,15 75,46 50,56' fill='%239F1239' /%3E%3Cpolygon points='32,50 50,58 50,82' fill='%23F43F5E' /%3E%3Cpolygon points='68,50 50,58 50,82' fill='%239F1239' /%3E%3Cpolygon points='12,50 25,80 47,85' fill='%239F1239' /%3E%3Cpolygon points='12,50 28,55 47,85' fill='%23F43F5E' /%3E%3Cpolygon points='88,50 75,80 53,85' fill='%23F43F5E' /%3E%3Cpolygon points='88,50 72,55 53,85' fill='%239F1239' /%3E%3C/svg%3E";

type LogoMap = { [key: string]: string | null };

export function useTokenLogos() {
  const [logos, setLogos] = useState<LogoMap>({
    MNT: MNT_OFFICIAL_LOGO,
    WMNT: MNT_OFFICIAL_LOGO,
    USDY: USDY_OFFICIAL_LOGO,
    mETH: METH_OFFICIAL_LOGO
  });

  return logos;
}
