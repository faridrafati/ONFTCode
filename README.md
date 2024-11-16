# Creating the README.md content as a file and saving it

readme_content = """
# Cross-Chain Token Transfer with LayerZero

This project demonstrates how to deploy and send tokens cross-chain using LayerZero's Omnichain Fungible Token (OFT) framework between the Sepolia and Holesky test networks. The code utilizes `ethers.js`, `hardhat`, and `@layerzerolabs/lz-v2-utilities`.

## Prerequisites

Before deploying and running the script, make sure you have the following:

- **Node.js** installed
- **Hardhat** configured
- **Ethers.js** library
- Environment variables set for both Sepolia and Holesky networks
- ABI file (`abi.json`) available

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Sepolia Network Configuration
PRIVATE_KEY_SEPOLIA=<Your Sepolia Private Key>
ADDRESS_SEPOLIA=<Your Sepolia Wallet Address>
SEPOLIA_CONTRACT_ADDRESS=<Deployed Contract Address on Sepolia>
SEPOLIA_URL=<Sepolia RPC URL>
SEPOLIA_CHAINID=<Sepolia Chain ID>
SEPOLIA_LZ_END_ADDRESS=<LayerZero Endpoint Address on Sepolia>
SEPOLIA_LZID=<LayerZero Chain ID for Sepolia>

# Holesky Network Configuration
PRIVATE_KEY_HOLESKY=<Your Holesky Private Key>
ADDRESS_HOLESKY=<Your Holesky Wallet Address>
HOLESKY_CONTRACT_ADDRESS=<Deployed Contract Address on Holesky>
HOLESKY_URL=<Holesky RPC URL>
HOLESKY_CHAINID=<Holesky Chain ID>
HOLESKY_LZ_END_ADDRESS=<LayerZero Endpoint Address on Holesky>
HOLESKY_LZID=<LayerZero Chain ID for Holesky>
