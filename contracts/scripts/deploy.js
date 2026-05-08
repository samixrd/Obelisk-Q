const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log("═══════════════════════════════════════════════");
  console.log("  ObeliskVault Deployment — Mantle Network");
  console.log("═══════════════════════════════════════════════");
  console.log("Deployer:", deployer.address);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Balance:", hre.ethers.formatEther(
    await hre.ethers.provider.getBalance(deployer.address)
  ), "MNT");
  console.log("");

  // The agent address — use AGENT_ADDRESS env or default to deployer
  const agentAddress = process.env.AGENT_ADDRESS || deployer.address;
  console.log("Agent address:", agentAddress);

  // Deploy
  const Vault = await hre.ethers.getContractFactory("ObeliskVault");
  const vault = await Vault.deploy(agentAddress);
  await vault.waitForDeployment();

  const address = await vault.getAddress();

  console.log("");
  console.log("✅ ObeliskVault deployed successfully!");
  console.log("═══════════════════════════════════════════════");
  console.log("Contract:  ", address);
  console.log("Chain ID:  ", network.chainId.toString());
  console.log("Agent:     ", agentAddress);
  console.log("═══════════════════════════════════════════════");
  console.log("");
  console.log("Update your .env files:");
  console.log(`  VAULT_ADDRESS=${address}`);
  console.log(`  VITE_VAULT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
