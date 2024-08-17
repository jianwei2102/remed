async function main() {
  const Remed = await ethers.getContractFactory("Remed");
  const remed = await Remed.deploy();
  console.log("Contract Deployed to Address:", remed.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
