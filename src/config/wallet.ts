import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mantle } from '@reown/appkit/networks'

// 1. Get projectId from https://cloud.reown.com
// This is a temporary public ID for demo purposes
const projectId = '7611a511397b9195d038283a04976778'

// 2. Create a metadata object - optional
const metadata = {
  name: 'Obelisk Q',
  description: 'Autonomous Wealth Intelligence on Mantle',
  url: 'https://obeliskq.app', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// 3. Create the AppKit instance
export const modal = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [mantle],
  metadata,
  projectId,
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'apple', 'x', 'discord'],
    showWallets: true,
  },
  defaultAccountTypes: {
    eip155: 'smartAccount'
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#2563eb',
    '--w3m-border-radius-master': '2px'
  }
})
