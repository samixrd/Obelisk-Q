import { useState, useEffect } from 'react';

// Reliable TrustWallet URLs for MNT and USDY
const MNT_OFFICIAL_LOGO = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x3c3a81e81dc49A522A592e7622A7E711c06bf354/logo.png';
const USDY_OFFICIAL_LOGO = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x96F6eF951840721AdBF46Ac996b59E0235CB985C/logo.png';

// Custom high-fidelity SVG Data URI for mETH (Red Crystal with White BG)
const METH_OFFICIAL_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-50 -50 356 517'%3E%3Ccircle cx='128' cy='208' r='250' fill='%23ffffff' /%3E%3Cpath fill='%239F1239' d='M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z'/%3E%3Cpath fill='%23F43F5E' d='M127.962 0L0 212.32l127.962 75.639V154.158z'/%3E%3Cpath fill='%23881337' d='M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z'/%3E%3Cpath fill='%23E11D48' d='M127.962 416.905v-104.72L0 236.585z'/%3E%3Cpath fill='%239F1239' d='M127.961 287.958l127.96-75.637-127.96-58.162z'/%3E%3Cpath fill='%23F43F5E' d='M0 212.32l127.96 75.638v-133.8z'/%3E%3C/svg%3E";

type LogoMap = { [key: string]: string | null };

export function useTokenLogos() {
  const [logos, setLogos] = useState<LogoMap>({
    MNT: MNT_OFFICIAL_LOGO,
    USDY: USDY_OFFICIAL_LOGO,
    mETH: METH_OFFICIAL_LOGO
  });

  return logos;
}
