require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('dotenv').config()


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY], // Clé privée du compte avec des fonds sur Sepolia
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY, // Clé API d'Etherscan
  },
};