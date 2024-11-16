
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
```

## Deployment Instructions

### Step 1: Install Dependencies

Ensure all required dependencies are installed by running:

```bash
npm install
```

### Step 2: Compile the Contracts

Compile the smart contracts using Hardhat:

```bash
npx hardhat compile
```

### Step 3: Deploy the Contract

Deploy the contract to either the Sepolia or Holesky network:

```bash
npx hardhat run deploy/deploy.js --network sepolia
```

or

```bash
npx hardhat run scripts/deploy.js --network holesky
```

Replace `scripts/deploy.js` with the path to your deployment script if different.

## Running the Cross-Chain Transfer Script

### Step 1: Ensure the ABI is Available

Make sure the `abi.json` file containing the contract's ABI is present in the root directory.

### Step 2: Execute the Transfer Script

Run the script to mint tokens and send them cross-chain:

```bash
npx hardhat run scripts/sendOFT.js --network sepolia
```

or

```bash
npx hardhat run scripts/sendOFT.js --network holesky
```

### How the Script Works

1. **Setup and Configuration**:
   - The script reads configurations for the specified network (Sepolia or Holesky) from the environment variables.
   - Initializes providers, wallets, and contract instances for both networks.

2. **Deploy and Setup Peers**:
   - Deploys the contract and sets up peer connections between the Sepolia and Holesky networks for cross-chain communication.

3. **Minting Tokens**:
   - Mints a specified number of tokens to the sender's wallet on the active network.

4. **Send Tokens Cross-Chain**:
   - Constructs the parameters and executes the `send` function to transfer tokens from the active network to the target network using LayerZero.

5. **Check Balances**:
   - Logs initial and final token balances for both the sender and receiver on their respective networks.

### Example Output

```text
Set peer for MyOFT on sepolia to contract on holesky: <transaction-hash>
Minting successful: <transaction-hash>
Initial Sender Balance: 100.0, Initial Receiver Balance: 0.0
Send operation successful: <transaction-hash>
Final Sender Balance: 99.0, Final Receiver Balance: 1.0
```

## Notes

- Ensure the deployed contract addresses and LayerZero endpoint details are correctly configured in your `.env` file.
- The cross-chain transfer may have delays depending on the network conditions. The script includes methods to retrieve updated balances.

## Troubleshooting

- **Invalid Chain Specified**: Ensure you are using either `sepolia` or `holesky` as the network name.
- **Environment Variables Not Set**: Double-check that all necessary environment variables are correctly set in your `.env` file.
- **Contract ABI Missing**: Verify that `abi.json` is correctly placed and up-to-date.

## License

This project is licensed under the MIT License.
