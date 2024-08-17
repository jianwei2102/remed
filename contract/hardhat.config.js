require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { API_URL, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
  },
  // defaultNetwork: "sepolia",
  networks: {
    // hardhat: {},
    // sepolia: {
    //   url: API_URL,
    //   accounts: [`0x${PRIVATE_KEY}`],
    // },
    scrollTestnet: {
      url: "https://sepolia-rpc.scroll.io/",
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  settings: {
    optimizer: {
      runs: 200,
      enabled: true,
    },
  },
};
