const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();
  const agentAddress = process.env.AGENT_ADDRESS;
  if (!agentAddress) {
    console.error("Set AGENT_ADDRESS in .env");
    return;
  }
  
  // Initial assets for the registry (Mantle Mainnet)
  const initialAssets = [
    "0xcDA86A272531e8640cD7F1a92c01839911B90bb0", // mETH
    "0x5bE26527e817998A7206475496fDE1E68957c5A6", // USDY
    "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8"  // WMNT
  ];

  console.log("═══════════════════════════════════════════════");
  console.log("  ObeliskVault Deployment — Mantle Network");
  console.log("═══════════════════════════════════════════════");
  console.log("Deployer:", deployer.address);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Balance:", hre.ethers.formatEther(
    await hre.ethers.provider.getBalance(deployer.address)
  ), "MNT");
  console.log("");
  console.log("Agent address:", agentAddress);
  console.log("Initial assets:", initialAssets.length);

  // Deploy
  const Vault = await hre.ethers.getContractFactory("ObeliskVault");
  const vault = await Vault.deploy(agentAddress, initialAssets);
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
