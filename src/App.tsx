import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PrivyProvider } from "@privy-io/react-auth";
import Index from "./pages/Index.tsx";
import Docs from "./pages/Docs.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

// Mantle mainnet definition for Privy
const mantleChain = {
  id: 5000,
  name: 'Mantle',
  network: 'mantle',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mantle.xyz'],
    },
    public: {
      http: ['https://rpc.mantle.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Mantle Explorer', url: 'https://explorer.mantle.xyz' },
  },
};

const PRIVY_APP_ID = "cmpdv1pk3003a0di6qq5aqcyy"; // User's Privy App ID
const appId = import.meta.env.VITE_PRIVY_APP_ID || PRIVY_APP_ID;

const App = () => (
  <PrivyProvider
    appId={appId}
    config={{
      loginMethods: ['email', 'google', 'twitter', 'discord', 'apple', 'wallet'],
      appearance: {
        theme: 'dark',
        accentColor: '#2563eb',
        showWalletLoginFirst: false,
      },
      supportedChains: [mantleChain],
      defaultChain: mantleChain,
      embeddedWallets: {
        ethereum: {
          createOnLogin: 'users-without-wallets',
        },
      },
    }}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/docs" element={<Docs />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </PrivyProvider>
);

export default App;
