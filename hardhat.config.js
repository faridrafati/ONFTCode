require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
    ],
  },
  networks: {
    sepolia: {
      url: "https://rpc.sepolia.org",
      chainId: 11155111,
      accounts: [process.env.PRIVATE_KEY_SEPOLIA],
      deployment: {
        name: "SepoliaToken",
        symbol: "STK",
        minGasToTransfer: 3000000000000,
        lzEndpointAddress: "0x6EDCE65403992e310A62460808c4b910D972f10f",
        chainID: 40161,
      },
    },
    holesky: {
      url: "https://ethereum-holesky.publicnode.com",
      chainId: 17000,
      accounts: [process.env.PRIVATE_KEY_HOLESKY],
      deployment: {
        name: "HoleskyToken",
        symbol: "HTK",
        minGasToTransfer: 3000000000000,
        lzEndpointAddress: "0x6EDCE65403992e310A62460808c4b910D972f10f",
        chainID: 40217,
      },
    },
  },
};
