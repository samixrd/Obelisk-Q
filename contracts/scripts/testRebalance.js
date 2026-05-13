const { ethers } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();
  const vaultAddress = process.env.VAULT_ADDRESS;
  const targetToken = process.env.USDY_ADDRESS; 

  console.log("Vault:", vaultAddress);
  console.log("Triggering rebalance from owner (acting as agent)...");

  const vault = await ethers.getContractAt("ObeliskVault", vaultAddress);

  // Note: rebalance is restricted to agent or owner
  const tx = await vault.rebalance(ethers.getAddress(targetToken));
  console.log("Transaction sent:", tx.hash);

  const receipt = await tx.wait();
  console.log("Rebalance successful! Gas used:", receipt.gasUsed.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
