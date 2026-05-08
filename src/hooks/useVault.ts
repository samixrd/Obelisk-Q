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

// ── Replace with your deployed contract address after running deploy script ──
const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS ?? "";

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
  "function getBalance(address user) view returns (uint256)",
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
  txError:         string | null;
  isConnected:     boolean;
  isWrongNetwork:  boolean;
  address:         string | null;
  connect:         () => Promise<void>;
  refreshStats: () => Promise<void>;
  confirmations: number;
  explorerUrl: (hash: string) => string;
  txHistory: TransactionRecord[];
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
  const [address,    setAddress]    = useState<string | null>(null);
  const [txState,    setTxState]    = useState<TxStatus>("idle");
  const [txHash,     setTxHash]     = useState<string | null>(null);
  const [txError,    setTxError]    = useState<string | null>(null);
  const [vaultStats, setVaultStats] = useState<VaultStats | null>(null);
  const [confirmations, setConfirmations] = useState<number>(0);
  const [txHistory, setTxHistory] = useState<TransactionRecord[]>([]);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const simBalanceRef = useRef<Record<string, number>>({});  // memory-only sim balance (0% disk)

  const CHAIN_ID = "5000";

  const getExplorerUrl = useCallback((hash: string) => {
    return `${EXPLORER_URL}/tx/${hash}`;
  }, []);

  // Transaction history — memory-only, resets each session (0% disk persistence)
  const saveTx = useCallback((record: TransactionRecord) => {
    setTxHistory(prev => {
      const filtered = prev.filter(r => r.hash !== record.hash);
      return [record, ...filtered].slice(0, 20);
    });
  }, []);

  const isConnected = !!address;

  // ── Network Guard Helper ────────────────────────────────────────────────
  const checkAndSwitchNetwork = useCallback(async (): Promise<boolean> => {
    const eth = (window as Window & { ethereum?: any }).ethereum;
    if (!eth) return false;

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
  }, []);

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
  const refreshStats = useCallback(async () => {
    if (!VAULT_ADDRESS) return;

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
      let score = 85;
      let paused = false;
      let currentRegime = "Expansion";

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
      if (address) {
        try {
          const balRaw = await rpcCall("eth_call", [
            { to: VAULT_ADDRESS, data: encodeGetBalance(address) },
            "latest",
          ]);
          if (balRaw && balRaw !== "0x") {
            userBalance = formatMnt(BigInt(balRaw));
          }
        } catch (e) {
          console.warn("Vault user balance call failed", e);
        }
      }

      setVaultStats({
        totalDeposited: formatMnt(total),
        depositorCount: count,
        lastScore:      score,
        paused,
        currentRegime,
        userBalance,
        walletBalance,
      });

    } catch (err) {
      console.error("Stats fetch failed:", err);
    }
  }, [address]);

  // ── Deposit ─────────────────────────────────────────────────────────────
  const deposit = useCallback(async (amountMnt: string) => {
    const eth = (window as Window & { ethereum?: Record<string, unknown> }).ethereum;
    if (!eth || !address) { await connect(); return; }
    
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
      const valueHex = "0x" + amountWei.toString(16);

      const hash = await (eth.request as Function)({
        method: "eth_sendTransaction",
        params: [{
          from:  address,
          to:    VAULT_ADDRESS,
          value: valueHex,
          data:  "0xd0e30db0",
        }],
      }) as string;

      setTxHash(hash);
      setTxState("pending");
      setConfirmations(0);

      toast({
        title: "Transaction submitted",
        description: `${hash.slice(0, 10)}...${hash.slice(-8)} ↗`,
      });

      saveTx({
        id: hash,
        type: "Deposit",
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
          const receipt = await (eth.request as Function)({
            method: "eth_getTransactionReceipt",
            params: [hash],
          });

          if (receipt) {
            // Check if tx failed at contract level
            if (receipt.status === "0x0") {
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

            const currentBlockRaw = await (eth.request as Function)({
              method: "eth_blockNumber",
            }) as string;
            
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
                amount: `${amountMnt} MNT`,
                status: "Confirmed",
                timestamp: new Date(),
                hash,
              });

              // Update simulated balance (memory-only)
              const currentSim = simBalanceRef.current[address || "null"] || 0;
              simBalanceRef.current[address || "null"] = currentSim + parseFloat(amountMnt);
              
              await refreshStats();
              clearInterval(interval);
            }
          }
        } catch (e) { console.error("Polling error", e); }
      }, 3000);

    } catch (err: unknown) {
      setTxState("error");
      const msg = (err as Error).message ?? "Transaction failed";
      setTxError(msg);
      toast({
        title: "Transaction failed",
        description: "View details on Explorer ↗",
        variant: "destructive",
        onClick: () => txHash && window.open(getExplorerUrl(txHash), "_blank"),
      } as any);
    }
  }, [address, connect, refreshStats, saveTx, getExplorerUrl]);

  // ── Withdraw ────────────────────────────────────────────────────────────
  const withdraw = useCallback(async () => {
    const eth = (window as Window & { ethereum?: Record<string, unknown> }).ethereum;
    if (!eth || !address) return;

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

      const hash = await (eth.request as Function)({
        method: "eth_sendTransaction",
        params: [{
          from: address,
          to:   VAULT_ADDRESS,
          data: "0x3ccfd60b", // keccak256("withdraw()")
          gas:  gasLimit,
        }],
      }) as string;

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
          const receipt = await (eth.request as Function)({
            method: "eth_getTransactionReceipt",
            params: [hash],
          });
          if (receipt) {
            // Check failure
            if (receipt.status === "0x0") {
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

            const currentBlockRaw = await (eth.request as Function)({
              method: "eth_blockNumber",
            }) as string;
            
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
              await refreshStats();
              clearInterval(interval);
            }
          }
        } catch (e) { console.error("Polling error", e); }
      }, 3000);

    } catch (err: unknown) {
      setTxState("error");
      const msg = (err as Error).message ?? "Withdraw failed";
      setTxError(msg);
      toast({
        title: "Withdrawal failed",
        description: "View details on Explorer ↗",
        variant: "destructive",
        onClick: () => txHash && window.open(getExplorerUrl(txHash), "_blank"),
      } as any);
    }
  }, [address, refreshStats, saveTx, getExplorerUrl, vaultStats?.userBalance]);

  // ── Withdraw Partial ───────────────────────────────────────────────────
  const withdrawPartial = useCallback(async (amountMnt: string) => {
    const eth = (window as Window & { ethereum?: Record<string, unknown> }).ethereum;
    if (!eth || !address) return;

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
      const selector = "8e19899e"; // keccak256("withdrawPartial(uint256)")
      const paddedAmount = amountWei.toString(16).padStart(64, "0");
      const data = "0x" + selector + paddedAmount;

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

      const hash = await (eth.request as Function)({
        method: "eth_sendTransaction",
        params: [{ from: address, to: VAULT_ADDRESS, data, gas: gasLimit }],
      }) as string;

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
          const receipt = await (eth.request as Function)({
            method: "eth_getTransactionReceipt",
            params: [hash],
          });
          if (receipt) {
            // Check failure
            if (receipt.status === "0x0") {
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

            const currentBlockRaw = await (eth.request as Function)({
              method: "eth_blockNumber",
            }) as string;
            
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
              
              await refreshStats();
              clearInterval(interval);
            }
          }
        } catch (e) { console.error("Polling error", e); }
      }, 3000);

    } catch (err: unknown) {
      setTxState("error");
      const msg = (err as Error).message ?? "Withdraw failed";
      setTxError(msg);
      toast({
        title: "Withdrawal failed",
        description: "View details on Explorer ↗",
        variant: "destructive",
        onClick: () => txHash && window.open(getExplorerUrl(txHash), "_blank"),
      } as any);
    }
  }, [address, refreshStats, saveTx, getExplorerUrl]);
  useEffect(() => {
    refreshStats();
    const id = setInterval(refreshStats, 15_000);
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
      })
      .catch(console.error);

    const handler = (accounts: string[]) => setAddress(accounts[0] ?? null);
    const chainHandler = () => checkAndSwitchNetwork();

    (eth as Record<string, Function>).on?.("accountsChanged", handler);
    (eth as Record<string, Function>).on?.("chainChanged", chainHandler);

    return () => {
      (eth as Record<string, Function>).removeListener?.("accountsChanged", handler);
      (eth as Record<string, Function>).removeListener?.("chainChanged", chainHandler);
    };
  }, [checkAndSwitchNetwork]);

  return { 
    deposit, withdraw, withdrawPartial, 
    vaultStats, txState, setTxState, txHash, txError, 
    isConnected, isWrongNetwork, address, connect, refreshStats,
    confirmations, explorerUrl: getExplorerUrl,
    txHistory
  };
}
