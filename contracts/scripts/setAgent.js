const hre = require("hardhat");

async function main() {
  const vaultAddress = "0x5Bf03F32219fe8bC1D7666c65bf26C26f70bD3b3";
  const agentAddress = "0x5698E89Ec2396e02679ddde33c2BA78de88F7fce";

  console.log(`Setting agent to ${agentAddress} on vault ${vaultAddress}...`);

  const ObeliskVault = await hre.ethers.getContractFactory("ObeliskVault");
  const vault = await ObeliskVault.attach(vaultAddress);

  const tx = await vault.setAgent(agentAddress);
  console.log("Transaction sent! Hash:", tx.hash);

  await tx.wait();
  console.log("Transaction confirmed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
