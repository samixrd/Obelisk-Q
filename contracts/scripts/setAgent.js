const hre = require("hardhat");

async function main() {
  const vaultAddress = "0x43A07169f7f15A1d3dEC0fC0C0Dab5efE8dee1aB";
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
