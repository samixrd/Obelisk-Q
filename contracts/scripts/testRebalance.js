const { ethers } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();
  const vaultAddress = "0xEF3513E91098e893b6a925A018120d920aF90cD4";
  const targetToken = "0x5be26527e817998a7206475496fde1e68957c5a6"; // USDY
  const agentAddress = "0x5698E89Ec2396e02679ddde33c2BA78de88F7fce";

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
