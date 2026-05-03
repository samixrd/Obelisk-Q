const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying ObeliskVault...");
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(
    await hre.ethers.provider.getBalance(deployer.address)
  ), "MNT");

  // Deploy — deployer is also the initial agent
  const Vault = await hre.ethers.getContractFactory("ObeliskVault");
  const vault = await Vault.deploy(deployer.address);
  await vault.waitForDeployment();

  const address = await vault.getAddress();

  console.log("\n✅ ObeliskVault deployed!");
  console.log("Contract address:", address);
  console.log("Network:         Mantle Sepolia Testnet");
  console.log("Chain ID:        5003");
  console.log("\nCopy this into your frontend .env.local:");
  console.log(`VITE_VAULT_ADDRESS=${address}`);
  console.log(`VITE_CHAIN_ID=5003`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
