const { ethers } = require("hardhat");

async function main() {
  const vaultAddress = process.env.VAULT_ADDRESS;
  const agentAddress = process.env.AGENT_ADDRESS;

  if (!vaultAddress || !agentAddress) {
    throw new Error("VAULT_ADDRESS and AGENT_ADDRESS must be set in .env");
  }

  console.log("Setting agent on vault:", vaultAddress);
  console.log("Agent:", agentAddress);

  const vault = await ethers.getContractAt("ObeliskVault", vaultAddress);
  const tx = await vault.setAgent(agentAddress);
  
  await tx.wait();
  console.log("Agent set! Hash:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
