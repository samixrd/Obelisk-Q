const { ethers } = require("hardhat");

async function main() {
  const vaultAddress = "0xfEDA159aA1E6fE3aEDd0AD566d492D2C94591389";
  const agentAddress = "0x5698E89Ec2396e02679ddde33c2BA78de88F7fce";

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
