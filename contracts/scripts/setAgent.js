const { ethers } = require("hardhat");

async function main() {
  const vaultAddress = "0xEF3513E91098e893b6a925A018120d920aF90cD4";
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
