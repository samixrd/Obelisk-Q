/**
 * useVault.ts — ObeliskVault contract interaction hook
 *
 * Provides deposit, withdraw, and vault stats reading
 * without any external wagmi/web3 library dependency.
 * Uses window.ethereum directly — works with MetaMask.
 *
 * usage:
 *   const { deposit, withdraw, vaultStats, txState } = useVault()
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useWallets, usePrivy } from "@privy-io/react-auth";
import { BrowserProvider } from "ethers";
import { useAuth } from "@/context/AuthContext";

// ── Replace with your deployed contract address after running deploy script ──
const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS ?? "";
const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS || "0x430cd09f8Ab6C1Ab50aa7f47FbAC94218cA65374";

const CHAIN_ID = "5000";
const CHAIN_ID_HEX = "0x1388";
const CHAIN_NAME = "Mantle";
const EXPLORER_URL = "https://explorer.mantle.xyz";

// Use QuickNode RPC from env as primary, fallback to public Mantle RPC
const RPC_URL = import.meta.env.VITE_RPC_URL || "https://rpc.mantle.xyz";

// Minimal ABI — only what the frontend needs
const VAULT_ABI = [
  "function deposit() payable",
  "function withdraw()",
  "function withdraw(uint256)",
  "function getBalance(address user) view returns (uint256)",
  "function getWithdrawableBalance(address user) view returns (uint256)",
  "function getTotalVaultValue() view returns (uint256)",
  "function getVaultStats() view returns (uint256, uint256, uint256, bool, string)",
  "function vaultPaused() view returns (bool)",
];

export type TxStatus = "idle" | "waiting" | "pending" | "success" | "error";

export interface VaultStats {
  totalDeposited:  string;   // in MNT (formatted)
  depositorCount:  number;
  lastScore:       number;
  paused:          boolean;
  currentRegime:   string;
  userBalance:     string;   // in MNT (formatted)
  walletBalance:   string;   // native MNT balance
  vaultMntBalance: string;   // native MNT balance of the vault contract
  userRawBalance:  string;   // user raw deposited MNT balance
}

export interface TransactionRecord {
  id: string;
  type: "Deposit" | "Withdraw";
  amount: string;
  status: "Confirmed" | "Failed" | "Pending";
  timestamp: Date;
  hash: string;
}

export interface VaultState {
  deposit:         (amountMnt: string) => Promise<void>;
  withdraw:        () => Promise<void>;
  withdrawPartial: (amountMnt: string) => Promise<void>;
  vaultStats:      VaultStats | null;
  txState:         TxStatus;
  setTxState:      (s: TxStatus) => void;
  txHash:          string | null;
  txError: string | null;
  isConnected:     boolean;
  isWrongNetwork:  boolean;
  address:         string | null;
  connect:         () => Promise<void>;
  refreshStats: () => Promise<void>;
  confirmations: number;
  explorerUrl: (hash: string) => string;
  txHistory: TransactionRecord[];
  externalWallet: string | null;
  registerExternalWallet: (addr: string) => Promise<boolean>;
  withdrawToExternal: () => Promise<void>;
  withdrawPartialToExternal: (amountMnt: string) => Promise<void>;
  sendMnt: (toAddress: string, amountMnt: string) => Promise<void>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatMnt(wei: bigint): string {
  const mnt = Number(wei) / 1e18;
  return mnt.toFixed(4);
}

function encodeGetBalance(address: string): string {
  // keccak256("getBalance(address)") = 0xf8b2cb4f, then pad address
  const sig = "f8b2cb4f";
  const padded = address.replace("0x", "").toLowerCase().padStart(64, "0");
  return "0x" + sig + padded;
}

function encodeGetWithdrawableBalance(address: string): string {
  // keccak256("getWithdrawableBalance(address)") first 4 bytes = 0x843592d3
  const sig = "843592d3";
  const padded = address.replace("0x", "").toLowerCase().padStart(64, "0");
  return "0x" + sig + padded;
}

/** 
 * Safe parse units for 18 decimals without floating point issues 
 */
function parseMntToWei(amount: string): bigint {
  try {
    const parts = amount.split(".");
    let whole = parts[0] || "0";
    let fraction = parts[1] || "";
    fraction = fraction.slice(0, 18).padEnd(18, "0");
    return BigInt(whole + fraction);
  } catch (e) {
    return 0n;
  }
}

function encodeGetVaultStats(): string {
  // keccak256("getVaultStats()") first 4 bytes = 0x3f4c3e1f
  return "0x3f4c3e1f";
}

// ── Direct RPC Helper (Wallet Independent) ───────────────────────────────────
async function rpcCall(method: string, params: any[]): Promise<any> {
  if (!RPC_URL) return null;
  try {
    const response = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    const json = await response.json();
    if (json.error) throw new Error(json.error.message);
    return json.result;
  } catch (err) {
    console.error("RPC Call failed:", err);
    return null;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useVault(): VaultState {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { sessionToken, isEmbeddedWallet } = useAuth();
  const activeWallet = wallets.find(w => w.address.toLowerCase() === user?.wallet?.address?.toLowerCase()) || wallets[0];
  const [address,    setAddress]    = useState<string | null>(null);

  // Sync address with Privy
  useEffect(() => {
    if (activeWallet?.address) {
      setAddress(activeWallet.address);
    } else {
      setAddress(null);
    }
  }, [activeWallet]);
  const [txState,    setTxState]    = useState<TxStatus>("idle");
  const [txHash,     setTxHash]     = useState<string | null>(null);
  const [txError,    setTxError]    = useState<string | null>(null);
  const [vaultStats, setVaultStats] = useState<VaultStats | null>(null);
  const [confirmations, setConfirmations] = useState<number>(0);
  const [txHistory, setTxHistory] = useState<TransactionRecord[]>([]);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const simBalanceRef = useRef<Record<string, number>>({});  // memory-only sim balance (0% disk)

  const CHAIN_ID = "5000";
  const lastFetchRef = useRef<number>(0);
  const lastAddressRef = useRef<string | null>(null);

  const getExplorerUrl = useCallback((hash: string) => {
    return `${EXPLORER_URL}/tx/${hash}`;
  }, []);

  // Load history from localStorage on mount
  useEffect(() => {
    if (!address) return;
    const saved = localStorage.getItem(`obelisk_txs_${address}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTxHistory(parsed.map((tx: any) => ({ ...tx, timestamp: new Date(tx.timestamp) })));
      } catch (e) { console.error("Failed to parse history", e); }
    }
  }, [address]);

  // Transaction history — persisted to localStorage
  const saveTx = useCallback((record: TransactionRecord) => {
    if (!address) return;
    setTxHistory(prev => {
      const filtered = prev.filter(r => r.hash !== record.hash);
      const updated = [record, ...filtered].slice(0, 20);
      localStorage.setItem(`obelisk_txs_${address}`, JSON.stringify(updated));
      return updated;
    });
  }, [address]);

  const isConnected = !!address;

  // ── Network Guard Helper ────────────────────────────────────────────────
  const checkAndSwitchNetwork = useCallback(async (): Promise<boolean> => {
    if (activeWallet) {
      try {
        if (Number(activeWallet.chainId) === 5000) {
          setIsWrongNetwork(false);
          return true;
        }
        await activeWallet.switchChain(5000);
        setIsWrongNetwork(false);
        return true;
      } catch (err) {
        console.error("Privy network switch failed:", err);
      }
    }

    const eth = (window as Window & { ethereum?: any }).ethereum;
    if (!eth) {
      if (activeWallet) return true;
      return false;
    }

    try {
      const currentChainId = await eth.request({ method: "eth_chainId" });
      if (currentChainId === CHAIN_ID_HEX) {
        setIsWrongNetwork(false);
        return true;
      }

      setIsWrongNetwork(true);
      
      // Try to switch
      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CHAIN_ID_HEX }],
        });
        setIsWrongNetwork(false);
        return true;
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await eth.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId:         CHAIN_ID_HEX,
                chainName:       CHAIN_NAME,
                nativeCurrency:  { name: "MNT", symbol: "MNT", decimals: 18 },
                rpcUrls:         [RPC_URL],
                blockExplorerUrls: [EXPLORER_URL],
              }],
            });
            setIsWrongNetwork(false);
            return true;
          } catch (addError) {
            console.error("Failed to add network:", addError);
          }
        }
        console.error("Failed to switch network:", switchError);
      }
      return false;
    } catch (err) {
      console.error("Network check failed:", err);
      return false;
    }
  }, [activeWallet]);

  // ── Connect wallet ──────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    const eth = (window as Window & { ethereum?: Record<string, unknown> }).ethereum;
    if (!eth) {
      alert("MetaMask not found. Please install it.");
      return;
    }

    try {
      // Request accounts
      const accounts = await (eth.request as Function)({
        method: "eth_requestAccounts",
      }) as string[];
      setAddress(accounts[0]);

      // Guard network immediately after connecting
      await checkAndSwitchNetwork();
    } catch (err) {
      console.error("Connect failed:", err);
    }
  }, [checkAndSwitchNetwork]);

  // ── Read vault stats ────────────────────────────────────────────────────
  const refreshStats = useCallback(async (force = false) => {
    if (!VAULT_ADDRESS) return;

    // Cache: only fetch if > 8s since last successful fetch, and address hasn't changed
    const now = Date.now();
    const addressChanged = address !== lastAddressRef.current;
    if (!force && !addressChanged && now - lastFetchRef.current < 8000 && vaultStats) {
      return;
    }

    try {
      let walletBalance = "0.0000";
      if (address) {
        try {
          const rawBal = await rpcCall("eth_getBalance", [address, "latest"]);
          if (rawBal && rawBal !== "0x") {
            walletBalance = formatMnt(BigInt(rawBal));
          }
        } catch (e) { console.error("Failed to fetch native balance", e); }
      }

      let total = 0n;
      let count = 0;
      let score = 0;
      let paused = false;
      let currentRegime = "Loading...";

      try {
        const statsRaw = await rpcCall("eth_call", [
          { to: VAULT_ADDRESS, data: encodeGetVaultStats() },
          "latest",
        ]);

        if (statsRaw && statsRaw !== "0x") {
          const hex = statsRaw.replace("0x", "");
          total = BigInt("0x" + hex.slice(0, 64));
          count = parseInt(hex.slice(64, 128), 16);
          score = parseInt(hex.slice(128, 192), 16);
          paused = parseInt(hex.slice(192, 256), 16) !== 0;
          
          try {
            // dynamic string decoding (param 5)
            const offset = parseInt(hex.slice(256, 320), 16) * 2;
            if (hex.length >= offset + 64) {
              const length = parseInt(hex.slice(offset, offset + 64), 16) * 2;
              const strHex = hex.slice(offset + 64, offset + 64 + length);
              if (strHex) {
                const bytes = new Uint8Array(strHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
                currentRegime = new TextDecoder().decode(bytes).replace(/\0/g, ''); // cleanup null bytes
              }
            }
          } catch (e) {
            console.warn("Failed to decode regime string", e);
          }
        }
      } catch (e) {
        console.warn("Vault stats call failed", e);
      }

      let userBalance = "0.0000";
      let userRawBalance = "0.0000";
      if (address) {
        let rawBalanceOfUser = 0n;
        try {
          // Fetch raw getBalance first
          const rawBalOfUserRaw = await rpcCall("eth_call", [
            { to: VAULT_ADDRESS, data: encodeGetBalance(address) },
            "latest",
          ]);
          if (rawBalOfUserRaw && rawBalOfUserRaw !== "0x") {
            rawBalanceOfUser = BigInt(rawBalOfUserRaw);
          }
        } catch (e) {
          console.warn("Failed to fetch getBalance", e);
        }

        try {
          // Use getWithdrawableBalance — yield-inclusive, agent buffer already subtracted
          const balRaw = await rpcCall("eth_call", [
            { to: VAULT_ADDRESS, data: encodeGetWithdrawableBalance(address) },
            "latest",
          ]);
          if (balRaw && balRaw !== "0x") {
            const withdrawableBig = BigInt(balRaw);
            // Floor with raw deposit minus 0.01 ether agent buffer (since totalValue direct sum understates token value)
            const rawWithBuffer = rawBalanceOfUser > parseMntToWei("0.01") ? rawBalanceOfUser - parseMntToWei("0.01") : 0n;
            const finalUserBal = withdrawableBig > rawWithBuffer ? withdrawableBig : rawWithBuffer;
            userBalance = formatMnt(finalUserBal);
          }
        } catch (e) {
          // Fallback to legacy getBalance
          userBalance = formatMnt(rawBalanceOfUser);
        }
        userRawBalance = formatMnt(rawBalanceOfUser);
      }

      let vaultMntBalance = "0.0000";
      try {
        const rawVaultBal = await rpcCall("eth_getBalance", [VAULT_ADDRESS, "latest"]);
        if (rawVaultBal && rawVaultBal !== "0x") {
          vaultMntBalance = formatMnt(BigInt(rawVaultBal));
        }
      } catch (e) {
        console.error("Failed to fetch vault MNT balance", e);
      }

      // Use userBalance as a floor for totalDeposited to ensure AUM is never lower than user's own stake
      const userBalBigInt = address ? parseMntToWei(userBalance) : 0n;
      const finalTotal = total > userBalBigInt ? total : userBalBigInt;

      setVaultStats({
        totalDeposited: formatMnt(finalTotal),
        depositorCount: count,
        lastScore:      score,
        paused,
        currentRegime,
        userBalance,
        walletBalance,
        vaultMntBalance,
        userRawBalance,
      });

      lastFetchRef.current = Date.now();
      lastAddressRef.current = address;

    } catch (err) {
      console.error("Stats fetch failed:", err);
    }
  }, [address]);

  // ── Deposit ─────────────────────────────────────────────────────────────
  const deposit = useCallback(async (amountMnt: string) => {
    const eth = (window as Window & { ethereum?: Record<string, unknown> }).ethereum;
    if (!address) { await connect(); return; }
    
    // Safety check before processing
    const onCorrectNetwork = await checkAndSwitchNetwork();
    if (!onCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Mantle Mainnet to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!VAULT_ADDRESS)   { alert("Contract not deployed yet."); return; }

    setTxState("waiting");
    setTxError(null);
    setTxHash(null);

    try {
      const amountWei = parseMntToWei(amountMnt);
      let finalAmountWei = amountWei;
      let gasReserved = 0n;

      if (isEmbeddedWallet) {
        try {
          const balRaw = await rpcCall("eth_getBalance", [address, "latest"]);
          const currentBalanceWei = BigInt(balRaw);
          const GAS_RESERVE_WEI = 5000000000000000n; // 0.005 MNT

          if (currentBalanceWei - finalAmountWei < GAS_RESERVE_WEI) {
            if (currentBalanceWei > GAS_RESERVE_WEI) {
              finalAmountWei = currentBalanceWei - GAS_RESERVE_WEI;
              gasReserved = GAS_RESERVE_WEI;
            } else {
              const MIN_GAS_WEI = 2000000000000000n; // 0.002 MNT
              if (currentBalanceWei > MIN_GAS_WEI) {
                finalAmountWei = currentBalanceWei - MIN_GAS_WEI;
                gasReserved = MIN_GAS_WEI;
              } else {
                throw new Error("Insufficient balance to cover gas fees. Please deposit more MNT.");
              }
            }
          }
        } catch (err: any) {
          console.warn("Gas reserve check failed, continuing with full amount:", err);
        }
      }

      const finalAmountMnt = formatMnt(finalAmountWei);
      const feeWei = parseMntToWei("0.01");

      if (finalAmountWei <= feeWei) {
        throw new Error("Deposit amount must be greater than the 0.01 MNT fee");
      }

      const depositWei = finalAmountWei - feeWei;
      const finalDepositMnt = formatMnt(depositWei);
      const valueHex = "0x" + depositWei.toString(16);

      let hash;
      const walletProvider = activeWallet ? await activeWallet.getEthereumProvider() : null;
      const provider = walletProvider 
        ? new BrowserProvider(walletProvider as any) 
        : (eth ? new BrowserProvider(eth as any) : null);

      if (provider) {
        const signer = await provider.getSigner();

        // Step A: Send 1% Fee to Treasury
        const treasuryTx = await signer.sendTransaction({
          to: TREASURY_ADDRESS,
          value: feeWei,
        });
        await treasuryTx.wait();

        // Step B: Deposit 99% to Vault Contract
        const txResp = await signer.sendTransaction({
          to: VAULT_ADDRESS,
          value: depositWei,
          data: "0xd0e30db0" // deposit()
        });
        hash = txResp.hash;
      } else {
        throw new Error("No provider found to send transaction.");
      }

      setTxHash(hash);
      setTxState("pending");
      setConfirmations(0);

      toast({
        title: "Transaction submitted",
        description: gasReserved > 0n
          ? `Deposited ${finalDepositMnt} MNT (${formatMnt(gasReserved)} MNT reserved for gas)`
          : `${hash.slice(0, 10)}...${hash.slice(-8)} ↗`,
      });

      saveTx({
        id: hash,
        type: "Deposit",
        amount: `${finalDepositMnt} MNT`,
        status: "Pending",
        timestamp: new Date(),
        hash,
      });

      // poll for receipt and confirmations
      let isFinalized = false;
      const interval = setInterval(async () => {
        if (isFinalized) {
          clearInterval(interval);
          return;
        }

        try {
          const receipt = await rpcCall("eth_getTransactionReceipt", [hash]);

          if (receipt) {
            // Check if tx failed at contract level
            if (receipt.status === "0x0" || receipt.status === 0 || receipt.status === "0") {
              isFinalized = true;
              setTxState("error");
              setTxError("Transaction reverted on-chain");
              toast({
                title: "Transaction failed ✕",
                description: "The transaction was reverted. Click to view on Explorer.",
                variant: "destructive",
                onClick: () => window.open(getExplorerUrl(hash), "_blank"),
              } as any);
              clearInterval(interval);
              return;
            }

            const currentBlockRaw = await rpcCall("eth_blockNumber", []);
            
            if (currentBlockRaw) {
              const currentBlock = BigInt(currentBlockRaw);
              const receiptBlock = BigInt(receipt.blockNumber);
              const confs = Number(currentBlock - receiptBlock + 1n);
              setConfirmations(confs);

              if (confs >= 1 && !isFinalized) {
                isFinalized = true;
                setTxState("success");
                toast({
                  title: "Transaction confirmed ✓",
                  description: "View on Mantlescan ↗",
                  onClick: () => window.open(getExplorerUrl(hash), "_blank"),
                } as any);
                
                saveTx({
                  id: hash,
                  type: "Deposit",
                  amount: `${finalDepositMnt} MNT`,
                  status: "Confirmed",
                  timestamp: new Date(),
                  hash,
                });

                // Update simulated balance (memory-only)
                const currentSim = simBalanceRef.current[address || "null"] || 0;
                simBalanceRef.current[address || "null"] = currentSim + parseFloat(finalDepositMnt);
                
                // Update Cost Basis in localStorage for YTD calculation
                const currentCostBasis = parseFloat(localStorage.getItem(`obelisk_cost_basis_${address}`) || "0");
                localStorage.setItem(`obelisk_cost_basis_${address}`, (currentCostBasis + parseFloat(finalDepositMnt)).toString());

                await refreshStats(true);
                clearInterval(interval);
              }
            }
          }
        } catch (e) { console.error("Polling error", e); }
      }, 3000);

    } catch (err: any) {
      setTxState("error");
      const isCancelled = err?.code === 4001;
      const msg = err?.message ?? "Transaction failed";
      setTxError(msg);
      
      toast({
        title: isCancelled ? "Transaction Cancelled" : "Transaction failed",
        description: isCancelled 
          ? "Request was rejected." 
          : "View details on Explorer ↗",
        variant: isCancelled ? "default" : "destructive",
        onClick: () => !isCancelled && txHash && window.open(getExplorerUrl(txHash), "_blank"),
      } as any);
    }
  }, [address, connect, refreshStats, saveTx, getExplorerUrl, activeWallet]);

  // ── Withdraw ────────────────────────────────────────────────────────────
  const withdraw = useCallback(async () => {
    const eth = (window as Window & { ethereum?: Record<string, unknown> }).ethereum;
    if (!address) { await connect(); return; }

    // Safety check
    const onCorrectNetwork = await checkAndSwitchNetwork();
    if (!onCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Mantle Mainnet to continue.",
        variant: "destructive",
      });
      return;
    }

    setTxState("waiting");
    setTxError(null);

    try {
      let hash;
      const walletProvider = activeWallet ? await activeWallet.getEthereumProvider() : null;
      if (walletProvider) {
        const browserProvider = new BrowserProvider(walletProvider as any);
        const signer = await browserProvider.getSigner();
        const txResp = await signer.sendTransaction({
          to: VAULT_ADDRESS,
          data: "0x3ccfd60b" // withdraw()
        });
        hash = txResp.hash;
      } else if (eth) {
        // Estimate gas to catch reverts early
        let gasLimit = "0x493E0"; // 300k safer fallback for Mantle
        try {
          const estimated = await (eth.request as Function)({
            method: "eth_estimateGas",
            params: [{ from: address, to: VAULT_ADDRESS, data: "0x3ccfd60b" }],
          }) as string;
          // Add 20% buffer
          gasLimit = "0x" + Math.floor(parseInt(estimated, 16) * 1.2).toString(16);
        } catch (e) {
          console.warn("Gas estimation failed, using fallback", e);
        }

        hash = await (eth.request as Function)({
          method: "eth_sendTransaction",
          params: [{
            from: address,
            to:   VAULT_ADDRESS,
            data: "0x3ccfd60b", // keccak256("withdraw()")
            gas:  gasLimit,
          }],
        }) as string;
      } else {
        throw new Error("No provider found to send transaction.");
      }

      setTxHash(hash);
      setTxState("pending");
      setConfirmations(0);

      toast({
        title: "Withdrawal submitted",
        description: `${hash.slice(0, 10)}...${hash.slice(-8)} ↗`,
      });

      saveTx({
        id: hash,
        type: "Withdraw",
        amount: `${vaultStats?.userBalance ?? "0"} MNT`,
        status: "Pending",
        timestamp: new Date(),
        hash,
      });

      const interval = setInterval(async () => {
        try {
          const receipt = await rpcCall("eth_getTransactionReceipt", [hash]);
          if (receipt) {
            // Check failure
            if (receipt.status === "0x0" || receipt.status === 0 || receipt.status === "0") {
              setTxState("error");
              setTxError("Withdrawal reverted on-chain");
              toast({
                title: "Withdrawal failed ✕",
                description: "Transaction was reverted. Click to view on Explorer.",
                variant: "destructive",
                onClick: () => window.open(getExplorerUrl(hash), "_blank"),
              } as any);
              clearInterval(interval);
              return;
            }

            const currentBlockRaw = await rpcCall("eth_blockNumber", []);
            if (currentBlockRaw) {
              const currentBlock = BigInt(currentBlockRaw);
              const receiptBlock = BigInt(receipt.blockNumber);
              const confs = Number(currentBlock - receiptBlock + 1n);
              setConfirmations(confs);

              if (confs >= 1) {
                setTxState("success");
                toast({
                  title: "Withdrawal confirmed ✓",
                  description: "Funds returned to wallet. View on Explorer ↗",
                  onClick: () => window.open(getExplorerUrl(hash), "_blank"),
                } as any);
                
                saveTx({
                  id: hash,
                  type: "Withdraw",
                  amount: `${vaultStats?.userBalance ?? "0"} MNT`,
                  status: "Confirmed",
                  timestamp: new Date(),
                  hash,
                });

                // Clear simulated balance (memory-only)
                simBalanceRef.current[address || "null"] = 0;
                // Clear Cost Basis
                localStorage.removeItem(`obelisk_cost_basis_${address}`);
                await refreshStats(true);
                clearInterval(interval);
              }
            }
          }
        } catch (e) { console.error("Polling error", e); }
      }, 3000);

    } catch (err: any) {
      setTxState("error");
      const isCancelled = err?.code === 4001;
      const msg = err?.message ?? "Withdraw failed";
      setTxError(msg);
      
      toast({
        title: isCancelled ? "Withdrawal Cancelled" : "Withdrawal failed",
        description: isCancelled 
          ? "Request was rejected." 
          : "View details on Explorer ↗",
        variant: isCancelled ? "default" : "destructive",
        onClick: () => !isCancelled && txHash && window.open(getExplorerUrl(txHash), "_blank"),
      } as any);
    }
  }, [address, refreshStats, saveTx, getExplorerUrl, vaultStats?.userBalance, activeWallet]);

  // ── Withdraw Partial ───────────────────────────────────────────────────
  const withdrawPartial = useCallback(async (amountMnt: string) => {
    const eth = (window as Window & { ethereum?: Record<string, unknown> }).ethereum;
    if (!address) { await connect(); return; }

    // Safety check
    const onCorrectNetwork = await checkAndSwitchNetwork();
    if (!onCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Mantle Mainnet to continue.",
        variant: "destructive",
      });
      return;
    }

    setTxState("waiting");
    setTxError(null);

    try {
      const amountWei = parseMntToWei(amountMnt);
      const selector = "2e1a7d4d"; // keccak256("withdraw(uint256)")
      const paddedAmount = amountWei.toString(16).padStart(64, "0");
      const data = "0x" + selector + paddedAmount;

      let hash;
      const walletProvider = activeWallet ? await activeWallet.getEthereumProvider() : null;
      if (walletProvider) {
        const browserProvider = new BrowserProvider(walletProvider as any);
        const signer = await browserProvider.getSigner();
        const txResp = await signer.sendTransaction({
          to: VAULT_ADDRESS,
          data
        });
        hash = txResp.hash;
      } else if (eth) {
        // Estimate gas
        let gasLimit = "0x493E0"; // 300k safer fallback for Mantle
        try {
          const estimated = await (eth.request as Function)({
            method: "eth_estimateGas",
            params: [{ from: address, to: VAULT_ADDRESS, data }],
          }) as string;
          // Add 20% buffer
          gasLimit = "0x" + Math.floor(parseInt(estimated, 16) * 1.2).toString(16);
        } catch (e) {
          console.warn("Gas estimation failed", e);
        }

        hash = await (eth.request as Function)({
          method: "eth_sendTransaction",
          params: [{ from: address, to: VAULT_ADDRESS, data, gas: gasLimit }],
        }) as string;
      } else {
        throw new Error("No provider found to send transaction.");
      }

      setTxHash(hash);
      setTxState("pending");
      setConfirmations(0);

      toast({
        title: "Withdrawal submitted",
        description: `${hash.slice(0, 10)}...${hash.slice(-8)} ↗`,
      });

      saveTx({
        id: hash,
        type: "Withdraw",
        amount: `${amountMnt} MNT`,
        status: "Pending",
        timestamp: new Date(),
        hash,
      });

      const interval = setInterval(async () => {
        try {
          const receipt = await rpcCall("eth_getTransactionReceipt", [hash]);
          if (receipt) {
            // Check failure
            if (receipt.status === "0x0" || receipt.status === 0 || receipt.status === "0") {
              setTxState("error");
              setTxError("Partial withdrawal reverted");
              toast({
                title: "Withdrawal failed ✕",
                description: "Transaction was reverted. View on Explorer ↗",
                variant: "destructive",
                onClick: () => window.open(getExplorerUrl(hash), "_blank"),
              } as any);
              clearInterval(interval);
              return;
            }

            const currentBlockRaw = await rpcCall("eth_blockNumber", []);
            if (currentBlockRaw) {
              const currentBlock = BigInt(currentBlockRaw);
              const receiptBlock = BigInt(receipt.blockNumber);
              const confs = Number(currentBlock - receiptBlock + 1n);
              setConfirmations(confs);

              if (confs >= 1) {
                setTxState("success");
                toast({
                  title: "Withdrawal confirmed ✓",
                  description: `Withdrew ${amountMnt} MNT. View on Explorer ↗`,
                  onClick: () => window.open(getExplorerUrl(hash), "_blank"),
                } as any);
                
                saveTx({
                  id: hash,
                  type: "Withdraw",
                  amount: `${amountMnt} MNT`,
                  status: "Confirmed",
                  timestamp: new Date(),
                  hash,
                });

                // Update simulated balance (memory-only)
                const currentSim = simBalanceRef.current[address || "null"] || 0;
                const newSim = Math.max(0, currentSim - parseFloat(amountMnt));
                simBalanceRef.current[address || "null"] = newSim;
                
                // Update Cost Basis proportionally
                const currentCostBasis = parseFloat(localStorage.getItem(`obelisk_cost_basis_${address}`) || "0");
                const ratio = parseFloat(amountMnt) / parseFloat(vaultStats?.userBalance || "1");
                const newCostBasis = Math.max(0, currentCostBasis * (1 - ratio));
                localStorage.setItem(`obelisk_cost_basis_${address}`, newCostBasis.toString());

                await refreshStats(true);
                clearInterval(interval);
              }
            }
          }
        } catch (e) { console.error("Polling error", e); }
      }, 3000);

    } catch (err: any) {
      setTxState("error");
      const isCancelled = err?.code === 4001;
      const msg = err?.message ?? "Withdraw failed";
      setTxError(msg);
      
      toast({
        title: isCancelled ? "Withdrawal Cancelled" : "Withdrawal failed",
        description: isCancelled 
          ? "Request was rejected." 
          : "View details on Explorer ↗",
        variant: isCancelled ? "default" : "destructive",
        onClick: () => !isCancelled && txHash && window.open(getExplorerUrl(txHash), "_blank"),
      } as any);
    }
  }, [address, refreshStats, saveTx, getExplorerUrl, activeWallet, vaultStats?.userBalance]);

  // ── Send MNT ─────────────────────────────────────────────────────────────
  const sendMnt = useCallback(async (toAddress: string, amountMnt: string) => {
    const eth = (window as Window & { ethereum?: Record<string, unknown> }).ethereum;
    if (!address) { await connect(); return; }

    const onCorrectNetwork = await checkAndSwitchNetwork();
    if (!onCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Mantle Mainnet to continue.",
        variant: "destructive",
      });
      return;
    }

    setTxState("waiting");
    setTxError(null);
    setTxHash(null);

    try {
      const amountWei = parseMntToWei(amountMnt);
      let hash;
      const walletProvider = activeWallet ? await activeWallet.getEthereumProvider() : null;
      const provider = walletProvider 
        ? new BrowserProvider(walletProvider as any) 
        : (eth ? new BrowserProvider(eth as any) : null);

      if (provider) {
        const signer = await provider.getSigner();
        const txResp = await signer.sendTransaction({
          to: toAddress,
          value: amountWei,
        });
        hash = txResp.hash;
      } else if (eth) {
        hash = await (eth.request as Function)({
          method: "eth_sendTransaction",
          params: [{
            from: address,
            to: toAddress,
            value: "0x" + amountWei.toString(16),
          }],
        }) as string;
      } else {
        throw new Error("No provider found to send transaction.");
      }

      setTxHash(hash);
      setTxState("pending");
      setConfirmations(0);

      toast({
        title: "Transfer submitted",
        description: `${hash.slice(0, 10)}...${hash.slice(-8)} ↗`,
      });

      saveTx({
        id: hash,
        type: "Withdraw", // Withdraw type matches native out-of-wallet transactions well
        amount: `${amountMnt} MNT`,
        status: "Pending",
        timestamp: new Date(),
        hash,
      });

      // poll for receipt and confirmations
      let isFinalized = false;
      const interval = setInterval(async () => {
        if (isFinalized) {
          clearInterval(interval);
          return;
        }

        try {
          const receipt = await rpcCall("eth_getTransactionReceipt", [hash]);

          if (receipt) {
            if (receipt.status === "0x0" || receipt.status === 0 || receipt.status === "0") {
              isFinalized = true;
              setTxState("error");
              setTxError("Transaction reverted on-chain");
              toast({
                title: "Transaction failed ✕",
                description: "The transaction was reverted. Click to view on Explorer.",
                variant: "destructive",
                onClick: () => window.open(getExplorerUrl(hash), "_blank"),
              } as any);
              clearInterval(interval);
              return;
            }

            const currentBlockRaw = await rpcCall("eth_blockNumber", []);
            
            if (currentBlockRaw) {
              const currentBlock = BigInt(currentBlockRaw);
              const receiptBlock = BigInt(receipt.blockNumber);
              const confs = Number(currentBlock - receiptBlock + 1n);
              setConfirmations(confs);

              if (confs >= 1 && !isFinalized) {
                isFinalized = true;
                setTxState("success");
                toast({
                  title: "Transfer confirmed ✓",
                  description: "View on Mantlescan ↗",
                  onClick: () => window.open(getExplorerUrl(hash), "_blank"),
                } as any);
                
                saveTx({
                  id: hash,
                  type: "Withdraw",
                  amount: `${amountMnt} MNT`,
                  status: "Confirmed",
                  timestamp: new Date(),
                  hash,
                });

                await refreshStats(true);
                clearInterval(interval);
              }
            }
          }
        } catch (e) { console.error("Polling error", e); }
      }, 3000);

    } catch (err: any) {
      setTxState("error");
      const isCancelled = err?.code === 4001;
      const msg = err?.message ?? "Transaction failed";
      setTxError(msg);
      
      toast({
        title: isCancelled ? "Transaction Cancelled" : "Transaction failed",
        description: isCancelled 
          ? "Request was rejected." 
          : "View details on Explorer ↗",
        variant: isCancelled ? "default" : "destructive",
        onClick: () => !isCancelled && txHash && window.open(getExplorerUrl(txHash), "_blank"),
      } as any);
    }
  }, [address, connect, checkAndSwitchNetwork, activeWallet, saveTx, getExplorerUrl, refreshStats]);


  useEffect(() => {
    refreshStats(true); // force first load when hook mounts or address updates
    const id = setInterval(refreshStats, 8000);
    return () => clearInterval(id);
  }, [refreshStats]);

  // ── Listen for account changes ──────────────────────────────────────────
  useEffect(() => {
    const eth = (window as Window & { ethereum?: Record<string, unknown> }).ethereum;
    if (!eth) return;
    
    // Fetch initial account if already connected
    (eth as Record<string, Function>).request?.({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts.length > 0) setAddress(accounts[0]);
      });

    const handler = (accounts: string[]) => setAddress(accounts[0] ?? null);
    const chainHandler = () => checkAndSwitchNetwork();

    (eth as Record<string, Function>).on?.("accountsChanged", handler);
    (eth as Record<string, Function>).on?.("chainChanged", chainHandler);

    return () => {
      (eth as Record<string, Function>).removeListener?.("accountsChanged", handler);
      (eth as Record<string, Function>).removeListener?.("chainChanged", chainHandler);
    };
  }, [checkAndSwitchNetwork]);

  // ── External Wallet Management ─────────────────────────────────────────
  const [externalWallet, setExternalWalletState] = useState<string | null>(null);

  const fetchExternalWallet = useCallback(async () => {
    if (!address || !sessionToken) return;
    try {
      const headers: Record<string, string> = {
        'x-session-token': sessionToken
      };
      const res = await fetch(`/api/user/withdraw-wallet?address=${encodeURIComponent(address)}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setExternalWalletState(data.external_wallet);
      }
    } catch (e) {
      console.error("Failed to fetch external wallet:", e);
    }
  }, [address, sessionToken]);

  useEffect(() => {
    fetchExternalWallet();
  }, [fetchExternalWallet]);

  const registerExternalWallet = useCallback(async (extWallet: string): Promise<boolean> => {
    if (!address || !sessionToken) return false;
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-session-token': sessionToken
      };
      const res = await fetch('/api/user/withdraw-wallet', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          address,
          external_wallet: extWallet
        })
      });
      if (res.ok) {
        const data = await res.json();
        setExternalWalletState(data.external_wallet);
        toast({
          title: "Wallet Registered",
          description: "Your withdrawal address was successfully registered.",
        });
        return true;
      } else {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to save wallet");
      }
    } catch (e: any) {
      console.error("Failed to register external wallet:", e);
      toast({
        title: "Registration Failed",
        description: e.message || "Failed to register withdrawal wallet.",
        variant: "destructive"
      });
      return false;
    }
  }, [address, sessionToken]);

  // ── Two-step Withdraw to External Wallet ─────────────────────────────────
  const withdrawToExternal = useCallback(async () => {
    const eth = (window as Window & { ethereum?: Record<string, unknown> }).ethereum;
    if (!address) { await connect(); return; }
    if (!externalWallet) {
      toast({
        title: "Registration Required",
        description: "Please register your external withdrawal wallet first.",
        variant: "destructive"
      });
      return;
    }

    const onCorrectNetwork = await checkAndSwitchNetwork();
    if (!onCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Mantle Mainnet to continue.",
        variant: "destructive",
      });
      return;
    }

    setTxState("waiting");
    setTxError(null);
    setTxHash(null);

    try {
      // Step 1: Withdraw from vault
      let hash;
      const walletProvider = activeWallet ? await activeWallet.getEthereumProvider() : null;
      if (walletProvider) {
        const browserProvider = new BrowserProvider(walletProvider as any);
        const signer = await browserProvider.getSigner();
        const txResp = await signer.sendTransaction({
          to: VAULT_ADDRESS,
          data: "0x3ccfd60b" // withdraw()
        });
        hash = txResp.hash;
      } else if (eth) {
        let gasLimit = "0x493E0";
        try {
          const estimated = await (eth.request as Function)({
            method: "eth_estimateGas",
            params: [{ from: address, to: VAULT_ADDRESS, data: "0x3ccfd60b" }],
          }) as string;
          gasLimit = "0x" + Math.floor(parseInt(estimated, 16) * 1.2).toString(16);
        } catch (e) { console.warn(e); }

        hash = await (eth.request as Function)({
          method: "eth_sendTransaction",
          params: [{ from: address, to: VAULT_ADDRESS, data: "0x3ccfd60b", gas: gasLimit }],
        }) as string;
      } else {
        throw new Error("No provider found to send transaction.");
      }

      setTxHash(hash);
      setTxState("pending");
      setConfirmations(0);

      toast({
        title: "Step 1/2: Vault Withdrawal",
        description: `Submitted vault withdrawal... ${hash.slice(0, 8)}`,
      });

      saveTx({
        id: hash,
        type: "Withdraw",
        amount: `${vaultStats?.userBalance ?? "0"} MNT`,
        status: "Pending",
        timestamp: new Date(),
        hash,
      });

      // Poll for vault withdrawal receipt
      const interval = setInterval(async () => {
        try {
          const receipt = await rpcCall("eth_getTransactionReceipt", [hash]);
          if (receipt) {
            if (receipt.status === "0x0" || receipt.status === 0 || receipt.status === "0") {
              setTxState("error");
              setTxError("Vault withdrawal reverted");
              toast({
                title: "Withdrawal failed ✕",
                description: "Vault withdrawal was reverted.",
                variant: "destructive"
              });
              clearInterval(interval);
              return;
            }

            const currentBlockRaw = await rpcCall("eth_blockNumber", []);
            if (currentBlockRaw) {
              const currentBlock = BigInt(currentBlockRaw);
              const receiptBlock = BigInt(receipt.blockNumber);
              const confs = Number(currentBlock - receiptBlock + 1n);
              setConfirmations(confs);

              if (confs >= 1) {
                clearInterval(interval);
                
                toast({
                  title: "Step 1 Confirmed ✓",
                  description: "Initiating step 2: Auto-forwarding to external wallet...",
                });

                // Clear memory-only simulated balance and cost basis
                simBalanceRef.current[address || "null"] = 0;
                localStorage.removeItem(`obelisk_cost_basis_${address}`);

                // Step 2: Auto-forward to external wallet + deduct 1% fee
                setTimeout(async () => {
                  try {
                    // Fetch current wallet balance
                    const balRaw = await rpcCall("eth_getBalance", [address, "latest"]);
                    const balanceWei = BigInt(balRaw);

                    // Fetch gas price for native transfer
                    const gasPriceRaw = await rpcCall("eth_gasPrice", []);
                    const gasPrice = BigInt(gasPriceRaw);

                    // Gas for two native transfers (treasury fee + final forward) is exactly 42,000
                    const transferGasWei = 42000n * gasPrice;

                    if (balanceWei <= transferGasWei) {
                      throw new Error(`Insufficient wallet balance (${formatMnt(balanceWei)} MNT) to pay for transfer gas.`);
                    }

                    const withdrawableAfterGas = balanceWei - transferGasWei;
                    const feeWei = parseMntToWei("0.01"); // Flat 0.01 MNT fee
                    const forwardAmountWei = withdrawableAfterGas - feeWei;

                    let forwardHash;
                    const provider = walletProvider 
                      ? new BrowserProvider(walletProvider as any) 
                      : (eth ? new BrowserProvider(eth as any) : null);

                    if (provider) {
                      const signer = await provider.getSigner();

                      // A. Transfer 1% fee to treasury
                      const feeTx = await signer.sendTransaction({
                        to: TREASURY_ADDRESS,
                        value: feeWei,
                      });
                      await feeTx.wait();
                      const txResp = await signer.sendTransaction({
                        to: externalWallet,
                        value: forwardAmountWei,
                      });
                      forwardHash = txResp.hash;
                    } else if (eth) {
                      forwardHash = await (eth.request as Function)({
                        method: "eth_sendTransaction",
                        params: [{
                          from: address,
                          to: externalWallet,
                          value: "0x" + forwardAmountWei.toString(16),
                        }],
                      }) as string;
                    } else {
                      throw new Error("No provider found for forward transaction.");
                    }

                    setTxHash(forwardHash);
                    toast({
                      title: "Step 2/2: Forwarding Funds",
                      description: `Auto-forward transaction submitted... ${forwardHash.slice(0, 8)}`,
                    });

                    // Poll for forward transaction confirmation
                    const forwardInterval = setInterval(async () => {
                      try {
                        const forwardReceipt = await rpcCall("eth_getTransactionReceipt", [forwardHash]);
                        if (forwardReceipt) {
                          if (forwardReceipt.status === "0x0" || forwardReceipt.status === 0 || forwardReceipt.status === "0") {
                            setTxState("error");
                            setTxError("Auto-forward transaction reverted");
                            toast({
                              title: "Forwarding failed ✕",
                              description: "Auto-forward transfer was reverted.",
                              variant: "destructive"
                            });
                            clearInterval(forwardInterval);
                            return;
                          }

                          const curBlockRaw = await rpcCall("eth_blockNumber", []);
                          if (curBlockRaw) {
                            const curBlock = BigInt(curBlockRaw);
                            const recBlock = BigInt(forwardReceipt.blockNumber);
                            const forwardConfs = Number(curBlock - recBlock + 1n);

                            if (forwardConfs >= 1) {
                              setTxState("success");
                              toast({
                                title: "Withdrawal Complete ✓",
                                description: `Successfully withdrew and forwarded ${formatMnt(forwardAmountWei)} MNT to your registered wallet!`,
                              });

                              saveTx({
                                id: forwardHash,
                                type: "Withdraw",
                                amount: `${formatMnt(forwardAmountWei)} MNT`,
                                status: "Confirmed",
                                timestamp: new Date(),
                                hash: forwardHash,
                              });

                              await refreshStats(true);
                              clearInterval(forwardInterval);
                            }
                          }
                        }
                      } catch (e) { console.error("Forward poll error", e); }
                    }, 3000);

                  } catch (forwardErr: any) {
                    setTxState("error");
                    setTxError(forwardErr.message || "Failed to forward funds");
                    toast({
                      title: "Step 2 Failed",
                      description: forwardErr.message || "Failed to auto-forward funds to external wallet.",
                      variant: "destructive"
                    });
                  }
                }, 1000);
              }
            }
          }
        } catch (e) { console.error("Vault withdraw poll error", e); }
      }, 3000);

    } catch (err: any) {
      setTxState("error");
      setTxError(err.message || "Withdrawal failed");
      toast({
        title: "Withdrawal Failed",
        description: err.message || "Vault withdrawal failed.",
        variant: "destructive"
      });
    }
  }, [address, connect, checkAndSwitchNetwork, externalWallet, activeWallet, refreshStats, saveTx, vaultStats?.userBalance]);

  // ── Two-step Partial Withdraw to External Wallet ─────────────────────────
  const withdrawPartialToExternal = useCallback(async (amountMnt: string) => {
    const eth = (window as Window & { ethereum?: Record<string, unknown> }).ethereum;
    if (!address) { await connect(); return; }
    if (!externalWallet) {
      toast({
        title: "Registration Required",
        description: "Please register your external withdrawal wallet first.",
        variant: "destructive"
      });
      return;
    }

    const onCorrectNetwork = await checkAndSwitchNetwork();
    if (!onCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Mantle Mainnet to continue.",
        variant: "destructive",
      });
      return;
    }

    setTxState("waiting");
    setTxError(null);
    setTxHash(null);

    try {
      // Step 1: Withdraw partial from vault
      const amountWei = parseMntToWei(amountMnt);
      const selector = "2e1a7d4d"; // keccak256("withdraw(uint256)")
      const paddedAmount = amountWei.toString(16).padStart(64, "0");
      const data = "0x" + selector + paddedAmount;

      let hash;
      const walletProvider = activeWallet ? await activeWallet.getEthereumProvider() : null;
      if (walletProvider) {
        const browserProvider = new BrowserProvider(walletProvider as any);
        const signer = await browserProvider.getSigner();
        const txResp = await signer.sendTransaction({
          to: VAULT_ADDRESS,
          data
        });
        hash = txResp.hash;
      } else if (eth) {
        let gasLimit = "0x493E0";
        try {
          const estimated = await (eth.request as Function)({
            method: "eth_estimateGas",
            params: [{ from: address, to: VAULT_ADDRESS, data }],
          }) as string;
          gasLimit = "0x" + Math.floor(parseInt(estimated, 16) * 1.2).toString(16);
        } catch (e) { console.warn(e); }

        hash = await (eth.request as Function)({
          method: "eth_sendTransaction",
          params: [{ from: address, to: VAULT_ADDRESS, data, gas: gasLimit }],
        }) as string;
      } else {
        throw new Error("No provider found to send transaction.");
      }

      setTxHash(hash);
      setTxState("pending");
      setConfirmations(0);

      toast({
        title: "Step 1/2: Vault Withdrawal",
        description: `Submitted partial vault withdrawal... ${hash.slice(0, 8)}`,
      });

      saveTx({
        id: hash,
        type: "Withdraw",
        amount: `${amountMnt} MNT`,
        status: "Pending",
        timestamp: new Date(),
        hash,
      });

      // Poll for vault withdrawal receipt
      const interval = setInterval(async () => {
        try {
          const receipt = await rpcCall("eth_getTransactionReceipt", [hash]);
          if (receipt) {
            if (receipt.status === "0x0" || receipt.status === 0 || receipt.status === "0") {
              setTxState("error");
              setTxError("Vault withdrawal reverted");
              toast({
                title: "Withdrawal failed ✕",
                description: "Vault withdrawal was reverted.",
                variant: "destructive"
              });
              clearInterval(interval);
              return;
            }

            const currentBlockRaw = await rpcCall("eth_blockNumber", []);
            if (currentBlockRaw) {
              const currentBlock = BigInt(currentBlockRaw);
              const receiptBlock = BigInt(receipt.blockNumber);
              const confs = Number(currentBlock - receiptBlock + 1n);
              setConfirmations(confs);

              if (confs >= 1) {
                clearInterval(interval);
                
                toast({
                  title: "Step 1 Confirmed ✓",
                  description: "Initiating step 2: Auto-forwarding partial withdrawal to external wallet...",
                });

                // Update simulated balance and cost basis proportionally
                const currentSim = simBalanceRef.current[address || "null"] || 0;
                const newSim = Math.max(0, currentSim - parseFloat(amountMnt));
                simBalanceRef.current[address || "null"] = newSim;

                const currentCostBasis = parseFloat(localStorage.getItem(`obelisk_cost_basis_${address}`) || "0");
                const ratio = parseFloat(amountMnt) / parseFloat(vaultStats?.userBalance || "1");
                const newCostBasis = Math.max(0, currentCostBasis * (1 - ratio));
                localStorage.setItem(`obelisk_cost_basis_${address}`, newCostBasis.toString());

                // Step 2: Auto-forward withdrawn amount to external wallet + deduct 1% fee
                setTimeout(async () => {
                  try {
                    // Fetch gas price for native transfer
                    const gasPriceRaw = await rpcCall("eth_gasPrice", []);
                    const gasPrice = BigInt(gasPriceRaw);

                    // Gas for two native transfers (treasury fee + final forward) is exactly 42,000
                    const transferGasWei = 42000n * gasPrice;

                    if (amountWei <= transferGasWei) {
                      throw new Error(`Insufficient withdrawal amount (${formatMnt(amountWei)} MNT) to pay for transfer gas.`);
                    }

                    const withdrawableAfterGas = amountWei - transferGasWei;
                    const feeWei = parseMntToWei("0.01"); // Flat 0.01 MNT fee
                    const forwardAmountWei = withdrawableAfterGas - feeWei;

                    let forwardHash;
                    const provider = walletProvider 
                      ? new BrowserProvider(walletProvider as any) 
                      : (eth ? new BrowserProvider(eth as any) : null);

                    if (provider) {
                      const signer = await provider.getSigner();

                      // A. Transfer 1% fee to treasury
                      const feeTx = await signer.sendTransaction({
                        to: TREASURY_ADDRESS,
                        value: feeWei,
                      });
                      await feeTx.wait();

                      // B. Forward remaining 99% to external wallet
                      const txResp = await signer.sendTransaction({
                        to: externalWallet,
                        value: forwardAmountWei,
                      });
                      forwardHash = txResp.hash;
                    } else {
                      throw new Error("No provider found for forward transaction.");
                    }

                    setTxHash(forwardHash);
                    toast({
                      title: "Step 2/2: Forwarding Funds",
                      description: `Auto-forward transaction submitted... ${forwardHash.slice(0, 8)}`,
                    });

                    // Poll for forward transaction confirmation
                    const forwardInterval = setInterval(async () => {
                      try {
                        const forwardReceipt = await rpcCall("eth_getTransactionReceipt", [forwardHash]);
                        if (forwardReceipt) {
                          if (forwardReceipt.status === "0x0" || forwardReceipt.status === 0 || forwardReceipt.status === "0") {
                            setTxState("error");
                            setTxError("Auto-forward transaction reverted");
                            toast({
                              title: "Forwarding failed ✕",
                              description: "Auto-forward transfer was reverted.",
                              variant: "destructive"
                            });
                            clearInterval(forwardInterval);
                            return;
                          }

                          const curBlockRaw = await rpcCall("eth_blockNumber", []);
                          if (curBlockRaw) {
                            const curBlock = BigInt(curBlockRaw);
                            const recBlock = BigInt(forwardReceipt.blockNumber);
                            const forwardConfs = Number(curBlock - recBlock + 1n);

                            if (forwardConfs >= 1) {
                              setTxState("success");
                              toast({
                                title: "Withdrawal Complete ✓",
                                description: `Successfully withdrew and forwarded ${formatMnt(forwardAmountWei)} MNT to your registered wallet!`,
                              });

                              saveTx({
                                id: forwardHash,
                                type: "Withdraw",
                                amount: `${amountMnt} MNT`,
                                status: "Confirmed",
                                timestamp: new Date(),
                                hash: forwardHash,
                              });

                              await refreshStats(true);
                              clearInterval(forwardInterval);
                            }
                          }
                        }
                      } catch (e) { console.error("Forward poll error", e); }
                    }, 3000);

                  } catch (forwardErr: any) {
                    setTxState("error");
                    setTxError(forwardErr.message || "Failed to forward funds");
                    toast({
                      title: "Step 2 Failed",
                      description: forwardErr.message || "Failed to auto-forward funds to external wallet.",
                      variant: "destructive"
                    });
                  }
                }, 1000);
              }
            }
          }
        } catch (e) { console.error("Vault withdraw poll error", e); }
      }, 3000);

    } catch (err: any) {
      setTxState("error");
      setTxError(err.message || "Withdrawal failed");
      toast({
        title: "Withdrawal Failed",
        description: err.message || "Vault withdrawal failed.",
        variant: "destructive"
      });
    }
  }, [address, connect, checkAndSwitchNetwork, externalWallet, activeWallet, refreshStats, saveTx, vaultStats?.userBalance]);


return { 
  deposit, withdraw, withdrawPartial, 
  vaultStats, txState, setTxState, txHash, txError, 
  isConnected, isWrongNetwork, address, connect, refreshStats,
  confirmations, explorerUrl: getExplorerUrl,
  txHistory,
  externalWallet,
  registerExternalWallet,
  withdrawToExternal,
  withdrawPartialToExternal,
  sendMnt
};
}
