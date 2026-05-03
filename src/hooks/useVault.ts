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
      // getVaultStats()
      const statsRaw = await (eth.request as Function)({
        method: "eth_call",
        params: [{
          to:   VAULT_ADDRESS,
          data: encodeGetVaultStats(),
        }, "latest"],
      }) as string;

      if (statsRaw && statsRaw !== "0x") {
        const hex   = statsRaw.replace("0x", "");
        const total = BigInt("0x" + hex.slice(0, 64));
        const count = parseInt(hex.slice(64, 128), 16);
        const score = parseInt(hex.slice(128, 192), 16);
        const paused = parseInt(hex.slice(192, 256), 16) !== 0;

        let userBalance = "0.0000";
        if (address) {
          const balRaw = await (eth.request as Function)({
            method: "eth_call",
            params: [{
              to:   VAULT_ADDRESS,
              data: encodeGetBalance(address),
            }, "latest"],
          }) as string;
          if (balRaw && balRaw !== "0x") {
            userBalance = formatMnt(BigInt(balRaw));
          }
        }

        setVaultStats({
          totalDeposited: formatMnt(total),
          depositorCount: count,
          lastScore:      score,
          paused,
          userBalance,
        });
      }
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
          // deposit() selector = 0xd0e30db0
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
      // withdraw() selector = 0x3ccfd60b
      const hash = await (eth.request as Function)({
        method: "eth_sendTransaction",
        params: [{
          from: address,
          to:   VAULT_ADDRESS,
          data: "0x3ccfd60b",
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
      // withdrawPartial(uint256) selector = 0x8e19899e + padded amount
      const amountHex = amountWei.toString(16).padStart(64, "0");
      const data = "0x8e19899e" + amountHex;

      const hash = await (eth.request as Function)({
        method: "eth_sendTransaction",
        params: [{ from: address, to: VAULT_ADDRESS, data }],
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
