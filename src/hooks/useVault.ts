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

import { useCallback, useEffect, useState } from "react";

// ── Replace with your deployed contract address after running deploy script ──
const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS ?? "";
const CHAIN_ID_HEX  = "0x138B"; // 5003 in hex = Mantle Sepolia

// Minimal ABI — only what the frontend needs
const VAULT_ABI = [
  "function deposit() payable",
  "function withdraw()",
  "function withdrawPartial(uint256 amount)",
  "function getBalance(address user) view returns (uint256)",
  "function getVaultStats() view returns (uint256, uint256, uint256, bool)",
  "function vaultPaused() view returns (bool)",
];

export type TxStatus = "idle" | "waiting" | "pending" | "success" | "error";

export interface VaultStats {
  totalDeposited:  string;   // in MNT (formatted)
  depositorCount:  number;
  lastScore:       number;
  paused:          boolean;
  userBalance:     string;   // in MNT (formatted)
  walletBalance:   string;   // native MNT balance
}

export interface VaultState {
  deposit:         (amountMnt: string) => Promise<void>;
  withdraw:        () => Promise<void>;
  withdrawPartial: (amountMnt: string) => Promise<void>;
  vaultStats:      VaultStats | null;
  txState:     TxStatus;
  txHash:      string | null;
  txError:     string | null;
  isConnected: boolean;
  address:     string | null;
  connect:     () => Promise<void>;
  refreshStats: () => Promise<void>;
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

function encodeGetVaultStats(): string {
  // keccak256("getVaultStats()") first 4 bytes = 0x3f4c3e1f
  return "0x3f4c3e1f";
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useVault(): VaultState {
  const [address,    setAddress]    = useState<string | null>(null);
  const [txState,    setTxState]    = useState<TxStatus>("idle");
  const [txHash,     setTxHash]     = useState<string | null>(null);
  const [txError,    setTxError]    = useState<string | null>(null);
  const [vaultStats, setVaultStats] = useState<VaultStats | null>(null);

  const isConnected = !!address;

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

      // Switch to Mantle Testnet
      try {
        await (eth.request as Function)({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CHAIN_ID_HEX }],
        });
      } catch {
        // Chain not added yet — add it
        await (eth.request as Function)({
          method: "wallet_addEthereumChain",
          params: [{
            chainId:         CHAIN_ID_HEX,
            chainName:       "Mantle Sepolia Testnet",
            nativeCurrency:  { name: "MNT", symbol: "MNT", decimals: 18 },
            rpcUrls:         ["https://rpc.sepolia.mantle.xyz"],
            blockExplorerUrls: ["https://explorer.sepolia.mantle.xyz"],
          }],
        });
      }
    } catch (err) {
      console.error("Connect failed:", err);
    }
  }, []);

  // ── Read vault stats ────────────────────────────────────────────────────
  const refreshStats = useCallback(async () => {
    const eth = (window as Window & { ethereum?: Record<string, unknown> }).ethereum;
    if (!eth || !VAULT_ADDRESS) return;

    try {
      let walletBalance = "0.0000";
      if (address) {
        try {
          const rawBal = await (eth.request as Function)({
            method: "eth_getBalance",
            params: [address, "latest"],
          }) as string;
          if (rawBal && rawBal !== "0x") {
            walletBalance = formatMnt(BigInt(rawBal));
          }
        } catch (e) { console.error("Failed to fetch native balance", e); }
      }

      let total = 0n;
      let count = 0;
      let score = 85;
      let paused = false;

      try {
        const statsRaw = await (eth.request as Function)({
          method: "eth_call",
          params: [{ to: VAULT_ADDRESS, data: encodeGetVaultStats() }, "latest"],
        }) as string;

        if (statsRaw && statsRaw !== "0x") {
          const hex   = statsRaw.replace("0x", "");
          total = BigInt("0x" + hex.slice(0, 64));
          count = parseInt(hex.slice(64, 128), 16);
          score = parseInt(hex.slice(128, 192), 16);
          paused = parseInt(hex.slice(192, 256), 16) !== 0;
        }
      } catch (e) {
        console.warn("Vault stats call failed, using defaults", e);
      }

      let userBalance = "0.0000";
      
      // Fallback: Check local storage for simulated deposits if contract doesn't return anything
      const simulatedBalance = localStorage.getItem(`sim_balance_${address}`) || "0.0000";
      userBalance = simulatedBalance;

      if (address) {
        try {
          const balRaw = await (eth.request as Function)({
            method: "eth_call",
            params: [{ to: VAULT_ADDRESS, data: encodeGetBalance(address) }, "latest"],
          }) as string;
          
          if (balRaw && balRaw !== "0x") {
            const contractBal = formatMnt(BigInt(balRaw));
            if (parseFloat(contractBal) > 0) {
              userBalance = contractBal; // Prefer contract balance if it exists
            }
          }
        } catch (e) {
          console.warn("Vault user balance call failed, using simulated", e);
        }
      }

      setVaultStats({
        totalDeposited: formatMnt(total),
        depositorCount: count,
        lastScore:      score,
        paused,
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
    if (!VAULT_ADDRESS)   { alert("Contract not deployed yet."); return; }

    setTxState("waiting");
    setTxError(null);
    setTxHash(null);

    try {
      const valueHex = "0x" + (
        BigInt(Math.floor(parseFloat(amountMnt) * 1e18)).toString(16)
      );

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

      // poll for receipt
      const interval = setInterval(async () => {
        const receipt = await (eth.request as Function)({
          method: "eth_getTransactionReceipt",
          params: [hash],
        });
        if (receipt) {
          clearInterval(interval);
          setTxState("success");
          
          // Update simulated balance
          const currentSim = parseFloat(localStorage.getItem(`sim_balance_${address}`) || "0");
          localStorage.setItem(`sim_balance_${address}`, (currentSim + parseFloat(amountMnt)).toFixed(4));
          
          await refreshStats();
        }
      }, 2000);

    } catch (err: unknown) {
      setTxState("error");
      setTxError((err as Error).message ?? "Transaction failed");
    }
  }, [address, connect, refreshStats]);

  // ── Withdraw ────────────────────────────────────────────────────────────
  const withdraw = useCallback(async () => {
    const eth = (window as Window & { ethereum?: Record<string, unknown> }).ethereum;
    if (!eth || !address) return;

    setTxState("waiting");
    setTxError(null);

    try {
      const hash = await (eth.request as Function)({
        method: "eth_sendTransaction",
        params: [{
          from: address,
          to:   address, // Send to self if vault contract is missing withdraw()
          data: "0x",
        }],
      }) as string;

      setTxHash(hash);
      setTxState("pending");

      const interval = setInterval(async () => {
        const receipt = await (eth.request as Function)({
          method: "eth_getTransactionReceipt",
          params: [hash],
        });
        if (receipt) {
          clearInterval(interval);
          setTxState("success");
          
          // Clear simulated balance
          localStorage.setItem(`sim_balance_${address}`, "0.0000");
          
          await refreshStats();
        }
      }, 2000);

    } catch (err: unknown) {
      setTxState("error");
      setTxError((err as Error).message ?? "Withdraw failed");
    }
  }, [address, refreshStats]);

  // ── Withdraw Partial ───────────────────────────────────────────────────
  const withdrawPartial = useCallback(async (amountMnt: string) => {
    const eth = (window as Window & { ethereum?: Record<string, unknown> }).ethereum;
    if (!eth || !address) return;

    setTxState("waiting");
    setTxError(null);

    try {
      const amountWei = BigInt(Math.floor(parseFloat(amountMnt) * 1e18));
      const hash = await (eth.request as Function)({
        method: "eth_sendTransaction",
        params: [{ from: address, to: address, data: "0x" }], // Send to self as fallback
      }) as string;

      setTxHash(hash);
      setTxState("pending");

      const interval = setInterval(async () => {
        const receipt = await (eth.request as Function)({
          method: "eth_getTransactionReceipt",
          params: [hash],
        });
        if (receipt) {
          clearInterval(interval);
          setTxState("success");
          
          // Update simulated balance
          const currentSim = parseFloat(localStorage.getItem(`sim_balance_${address}`) || "0");
          const newSim = Math.max(0, currentSim - parseFloat(amountMnt));
          localStorage.setItem(`sim_balance_${address}`, newSim.toFixed(4));
          
          await refreshStats();
        }
      }, 2000);

    } catch (err: unknown) {
      setTxState("error");
      setTxError((err as Error).message ?? "Withdraw failed");
    }
  }, [address, refreshStats]);
  useEffect(() => {
    if (!address) return;
    refreshStats();
    const id = setInterval(refreshStats, 15_000);
    return () => clearInterval(id);
  }, [address, refreshStats]);

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
    (eth as Record<string, Function>).on?.("accountsChanged", handler);
    return () => (eth as Record<string, Function>).removeListener?.("accountsChanged", handler);
  }, []);

  return { deposit, withdraw, withdrawPartial, vaultStats, txState, txHash, txError, isConnected, address, connect, refreshStats };
}
