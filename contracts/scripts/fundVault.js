const { ethers } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();
  const vaultAddress = "0xfEDA159aA1E6fE3aEDd0AD566d492D2C94591389";
  
  console.log("Funding vault:", vaultAddress);
  console.log("From owner:", owner.address);

  const tx = await owner.sendTransaction({
    to: vaultAddress,
    value: ethers.parseEther("0.5")
  });

  await tx.wait();
  console.log("Vault funded! Hash:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
