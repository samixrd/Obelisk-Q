const { ethers } = require("hardhat");

async function main() {
  const vaultAddress = "0xEF3513E91098e893b6a925A018120d920aF90cD4";
  const mETHAddress = "0xcDA86A272531e8640cD7F1a92c01839911B90bb0";

  const bal = await ethers.provider.getBalance(vaultAddress);
  console.log("Vault MNT Balance:", ethers.formatEther(bal), "MNT");

  const mETH = await ethers.getContractAt("IERC20", mETHAddress);
  const mETHBal = await mETH.balanceOf(vaultAddress);
  console.log("Vault mETH Balance:", ethers.formatUnits(mETHBal, 18), "mETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
