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

  // Deploy Verifier
  const Verifier = await hre.ethers.getContractFactory("ZKRegimeVerifier");
  const verifier = await Verifier.deploy(agentAddress);
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();

  // Deploy Vault
  const Vault = await hre.ethers.getContractFactory("ObeliskVault");
  const vault = await Vault.deploy(agentAddress, initialAssets);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  // Link contracts
  await vault.setZKVerifier(verifierAddress);
  await verifier.setVault(vaultAddress);

  console.log("");
  console.log("✅ ObeliskVault & ZKRegimeVerifier deployed successfully!");
  console.log("═══════════════════════════════════════════════");
  console.log("Vault Address:   ", vaultAddress);
  console.log("Verifier Address:", verifierAddress);
  console.log("Chain ID:        ", network.chainId.toString());
  console.log("Agent/Prover:    ", agentAddress);
  console.log("═══════════════════════════════════════════════");
  console.log("");
  console.log("Update your .env files:");
  console.log(`  VAULT_ADDRESS=${vaultAddress}`);
  console.log(`  VITE_VAULT_ADDRESS=${vaultAddress}`);
  console.log(`  ZK_VERIFIER_ADDRESS=${verifierAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
