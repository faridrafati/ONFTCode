// Get the environment configuration from .env file
//
// To make use of automatic environment setup:
// - Duplicate .env.example file and name it .env
// - Fill in the environment variables
require('dotenv/config');
require('hardhat-deploy');
require('hardhat-contract-sizer');
require('@nomiclabs/hardhat-ethers');
require('@layerzerolabs/toolbox-hardhat');

const { EndpointId } = require('@layerzerolabs/lz-definitions');

module.exports = {
    paths: {
        cache: 'cache/hardhat',
    },
    solidity: {
        compilers: [
            {
                version: '0.8.22',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        sepolia: {
            eid: EndpointId.SEPOLIA_V2_TESTNET,
            url: process.env.SEPOLIA_URL,
            accounts: [process.env.PRIVATE_KEY_SEPOLIA],
            deployment: {
                name: 'sepoliaOFT',
                symbol: 'SFT',
                lzEndpointAddress: process.env.SEPOLIA_LZ_END_ADDRESS,
                delegate: process.env.ADDRESS_SEPOLIA,
            },
        },
        holesky: {
            eid: EndpointId.HOLESKY_V2_TESTNET,
            url: process.env.HOLESKY_URL,
            accounts: [process.env.PRIVATE_KEY_HOLESKY],
            deployment: {
                name: 'holeskyOFT',
                symbol: 'HFT',
                lzEndpointAddress: process.env.HOLESKY_LZ_END_ADDRESS,
                delegate: process.env.ADDRESS_HOLESKY,
            },
        },
        hardhat: {
            // Need this for testing because TestHelperOz5.sol is exceeding the compiled contract size limit
            allowUnlimitedContractSize: true,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0, // wallet address of index[0], of the mnemonic in .env
        },
    },
};
