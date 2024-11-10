ONFT Cross-Chain Project with LayerZero
Overview
This project implements an Omnichain Non-Fungible Token (ONFT) that can be transferred across multiple blockchain networks using LayerZero. LayerZero is an interoperability protocol that enables secure and seamless cross-chain interactions, allowing NFTs to move across different chains while retaining their unique properties.
Features
•	Cross-Chain NFT Transfer: Transfer ONFTs between supported blockchains with minimal effort.
•	Interoperability with LayerZero: Utilize LayerZero's protocol for secure and efficient communication across chains.
•	Scalable and Decentralized: Build decentralized applications (DApps) that scale across multiple networks.
Prerequisites
Before starting, ensure you have the following installed:
•	Node.js (version 16 or later)
•	Hardhat or Truffle
•	Ethers.js
•	A LayerZero-supported wallet (e.g., MetaMask)
•	Solidity compiler
Installation
1.	Clone the Repository:
bash
Copy code
git clone https://github.com/your-username/ONFT-cross-chain-layerzero.git
cd ONFT-cross-chain-layerzero
2.	Install Dependencies:
bash
Copy code
npm install
3.	Compile Contracts:
bash
Copy code
npx hardhat compile
Configuration
1.	LayerZero Configuration: Update the network configurations and LayerZero endpoint details in hardhat.config.js or your configuration file.
2.	Environment Variables: Create a .env file and add your private keys and RPC URLs:
ini
Copy code
PRIVATE_KEY=your-private-key
RPC_URL_MAINNET=https://mainnet.infura.io/v3/your-infura-project-id
RPC_URL_TESTNET=https://goerli.infura.io/v3/your-infura-project-id
Usage
1.	Deploy Contracts: Deploy the smart contract to your desired network:
bash
Copy code
npx hardhat run scripts/deploy.js --network <network-name>
2.	Transfer ONFTs: Use the following command or interact with your DApp to initiate cross-chain NFT transfers:
bash
Copy code
node scripts/transfer.js --network <source-network> --dest <destination-network> --tokenId <id>
Smart Contract Overview
The main contract, ONFT.sol, inherits from the LayerZero ONFT library to handle cross-chain communication.
Key Functions:
•	mint(address to, uint256 tokenId): Mints a new ONFT to the specified address.
•	crossChainTransfer(uint16 destinationChainId, uint256 tokenId): Transfers the specified ONFT to another chain.
Events:
•	CrossChainTransferInitiated(address from, uint16 toChainId, uint256 tokenId): Emitted when a cross-chain transfer starts.
•	CrossChainTransferCompleted(address to, uint16 fromChainId, uint256 tokenId): Emitted when a cross-chain transfer completes.
Supported Networks
This project is configured to support the following networks (expand as needed):
•	Ethereum Mainnet
•	Polygon
•	Binance Smart Chain (BSC)
•	Avalanche
•	Arbitrum
Resources
•	LayerZero Documentation
•	OpenZeppelin Contracts
•	Ethers.js Documentation
Contributing
Contributions are welcome! Please fork this repository and submit a pull request for any improvements or fixes.
License
This project is licensed under the MIT License. See the LICENSE file for details.
Contact
For questions or support, please reach out via email or open an issue in this repository.

