const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const vaultAddress = process.env.VAULT_ADDRESS || process.env.VITE_VAULT_ADDRESS;

  if (!vaultAddress) {
    console.error("Please set VAULT_ADDRESS in your .env file");
    return;
  }

  console.log("Restoring Vault stability...");
  const Vault = await hre.ethers.getContractAt("ObeliskVault", vaultAddress);

  // 1. Correct official addresses (using the original one for WMNT)
  const official = [
    "0xcda86a272531e8640cd7f1a92c01839911b90bb0", // mETH
    "0x5be26527e817998a7206475496fde1e68957c5a6", // USDY
    "0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8"  // Original WMNT (Working)
  ];

  // 2. Identify and REMOVE the bad address (the one that caused BAD_DATA)
  const badAddress = "0x78c1b0c116c64213d68d0234c6e099e447a1125d"; // The "New" one I gave you
  
  const isBadAllowed = await Vault.isAssetAllowed(badAddress);
  if (isBadAllowed) {
    console.log(`Removing problematic address: ${badAddress}`);
    const tx = await Vault.removeAsset(badAddress);
    await tx.wait();
    console.log("✅ Problematic address removed.");
  }

  // 3. Ensure official assets are added
  for (const asset of official) {
    const isAllowed = await Vault.isAssetAllowed(asset);
    if (!isAllowed) {
      console.log(`Ensuring official asset: ${asset}`);
      const tx = await Vault.addAsset(asset);
      await tx.wait();
      console.log(`✅ Asset synced: ${asset}`);
    }
  }

  console.log("✅ Vault restored! Dashboard should now show your 1.98 MNT balance.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
