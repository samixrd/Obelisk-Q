const hre = require("hardhat");

async function main() {
  // আপনার ডিপ্লয় করা কন্টাক্ট অ্যাড্রেস এখানে দিন
  const VAULT_ADDRESS = "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8"; // আপনার ভল্ট অ্যাড্রেস

  console.log("Starting withdrawal process...");
  const Vault = await hre.ethers.getContractFactory("ObeliskVault");
  const vault = await Vault.attach(VAULT_ADDRESS);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Withdrawing with account:", deployer.address);

  const tx = await vault.withdraw();
  console.log("Transaction hash:", tx.hash);

  await tx.wait();
  console.log("✅ Successfully withdrawn all funds to your wallet!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
