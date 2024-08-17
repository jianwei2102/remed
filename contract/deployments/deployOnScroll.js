const { ethers } = require("hardhat");

async function main() {
  const Remed = await ethers.getContractFactory("Remed");
  const remed = await Remed.deploy();

  console.log(`Deployed to ${remed.address}`);
  console.log(`Block explorer URL: https://blockscout.scroll.io/address/${remed.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
