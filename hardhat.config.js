require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337
    },
    goerli: { 
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_GOERLI_API_KEY}`,
      chainId: 5
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_SEPOLIA_API_KEY}`,
      chainId: 11155111,
      accounts: [`0x${process.env.process.PRIVATE_KEY_ONE, process.env.process.PRIVATE_KEY_TWO}`]
    }
  },
    
  solidity: "0.8.19",
};
