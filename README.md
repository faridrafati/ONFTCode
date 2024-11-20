# ONFTCode - OFTAdaptor

## Overview
This repository contains the implementation of an ONFT (Omnichain Non-Fungible Token) using LayerZero's OFT (Omnichain Fungible Token) Adapter. The goal of the project is to provide a cross-chain solution for NFTs that leverages the interoperability features of LayerZero.

## Introduction to OFTAdaptor
The OFT (Omnichain Fungible Token) Adapter is an extension of the LayerZero OFT protocol that allows seamless interaction between fungible and non-fungible tokens across multiple blockchains. By using the OFTAdaptor, developers can facilitate the transfer of NFTs in an omnichain context, enabling assets to move between different blockchains without the complexity of managing individual bridge mechanisms.

### OFTAdaptor vs. OFT
- **OFT (Omnichain Fungible Token)**: This is a protocol by LayerZero that facilitates the transfer of fungible tokens across different blockchain networks. It is primarily used for tokens that represent the same value across chains, such as ERC-20 tokens.
- **OFTAdaptor**: The OFTAdaptor extends the capabilities of OFT by allowing non-fungible tokens (NFTs) to leverage the same cross-chain messaging infrastructure. This means NFTs can now benefit from the same seamless interoperability that fungible tokens enjoy, making it easier to create and manage omnichain NFT projects.

The OFTAdaptor simplifies the process of adapting NFTs to a cross-chain environment by providing the necessary infrastructure to interact with other LayerZero-compatible tokens. This makes it possible for NFTs to retain their unique properties while becoming accessible across multiple blockchain networks.

## Features
- Cross-chain NFT transfers using LayerZero protocol.
- Integration of LayerZero's OFT Adapter to achieve seamless interoperability.
- Support for multiple EVM-compatible blockchains.

## Prerequisites
- Node.js (v14 or above)
- npm or yarn
- Hardhat (for testing and deployment)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/faridrafati/ONFTCode.git
   cd ONFTCode/OFTAdaptor
   ```

2. Install the dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

## Usage

### Compile
To compile the smart contracts, run:

```bash
npx hardhat compile
```

### Test
To run the tests, execute:

```bash
npx hardhat test
```

### Deployment
To deploy the contracts, update the configuration in `hardhat.config.js` and use the following command:

```bash
npx hardhat run deploy/deploy_ERC20.js --network <network-name>
npx hardhat run scripts/deploy_OFT.js --network <network-name>
npx hardhat run scripts/deploy_OFTAdapter.js --network <network-name>
```

Replace `<network-name>` with the desired network (e.g., `holesky`, `sepolia`).

## Cross-Chain Transfer Script
The repository also includes a script (`sendFTviaAdaptor.js`) to perform cross-chain token transfers using the LayerZero protocol. Below is an example script for reference:

### sendFTviaAdaptor.js

```javascript
const { ethers } = require('ethers');
const fs = require('fs').promises;
const { Options } = require('@layerzerolabs/lz-v2-utilities');
const { network } = require('hardhat');
require('dotenv').config();

async function getConfig(network) {
    if (network === 'Sepolia') {
        return {
            privateKey: process.env.PRIVATE_KEY_SEPOLIA,
            address: process.env.ADDRESS_SEPOLIA,
            contractERCAddress: process.env.SEPOLIA_ERC_ADDRESS,
            contractOFTAddress: process.env.SEPOLIA_OFT_ADDRESS,
            contractADPAddress: process.env.SEPOLIA_ADP_ADDRESS,
            rpcUrl: process.env.SEPOLIA_URL,
            chainId: parseInt(process.env.SEPOLIA_CHAINID, 10),
            lzEndAddress: process.env.SEPOLIA_LZ_END_ADDRESS,
            lzId: parseInt(process.env.SEPOLIA_LZID, 10),
        };
    } else if (network === 'Holesky') {
        return {
            privateKey: process.env.PRIVATE_KEY_HOLESKY,
            address: process.env.ADDRESS_HOLESKY,
            contractERCAddress: process.env.HOLESKY_ERC_ADDRESS,
            contractOFTAddress: process.env.HOLESKY_OFT_ADDRESS,
            contractADPAddress: process.env.HOLESKY_ADP_ADDRESS,
            rpcUrl: process.env.HOLESKY_URL,
            chainId: parseInt(process.env.HOLESKY_CHAINID, 10),
            lzEndAddress: process.env.HOLESKY_LZ_END_ADDRESS,
            lzId: parseInt(process.env.HOLESKY_LZID, 10),
        };
    } else {
        throw new Error('Unsupported network specified');
    }
}

async function main() {
    const abiERC = JSON.parse(await fs.readFile('abiERC.json', 'utf8'));
    const abiOFT = JSON.parse(await fs.readFile('abiOFT.json', 'utf8'));
    const abiADP = JSON.parse(await fs.readFile('abiADP.json', 'utf8'));

    let networkFrom, networkTo;

    if (network.name === 'sepolia') {
        networkFrom = 'Sepolia';
        networkTo = 'Holesky';
    } else if (network.name === 'holesky') {
        networkFrom = 'Holesky';
        networkTo = 'Sepolia';
    } else {
        throw new Error('Unsupported network. Use "sepolia" or "holesky".');
    }

    const configFrom = await getConfig(networkFrom);
    const configTo = await getConfig(networkTo);

    const providerFrom = new ethers.providers.JsonRpcProvider(configFrom.rpcUrl);
    const walletFrom = new ethers.Wallet(configFrom.privateKey, providerFrom);

    const providerTo = new ethers.providers.JsonRpcProvider(configTo.rpcUrl);
    const walletTo = new ethers.Wallet(configTo.privateKey, providerTo);

    const myOFTAdapterFrom = new ethers.Contract(configFrom.contractADPAddress, abiADP, walletFrom);
    const myOFTTo = new ethers.Contract(configTo.contractOFTAddress, abiOFT, walletTo);

    const myERC = new ethers.Contract(configFrom.contractERCAddress, abiERC, walletFrom);

    const initialBalanceFrom = await myERC.balanceOf(configFrom.address);
    const initialBalanceAdapter = await myERC.balanceOf(myOFTAdapterFrom.address);
    const initialBalanceTo = await myOFTTo.balanceOf(configTo.address);

    console.log(`Initial balance of sender on ${networkFrom} : ${ethers.utils.formatEther(initialBalanceFrom)}`);
    console.log(`Initial balance of Adapter on ${networkFrom}: ${ethers.utils.formatEther(initialBalanceAdapter)}`);
    console.log(`Initial balance of Receiver on ${networkTo}: ${ethers.utils.formatEther(initialBalanceTo)}`);

    const tokensToSend = ethers.utils.parseEther('1');
    try {
        let tx = await myOFTAdapterFrom
            .connect(walletFrom)
            .setPeer(configTo.lzId, ethers.utils.zeroPad(myOFTTo.address, 32));
        await tx.wait();
        console.log(`Set peer for myOFTAdapterFrom ${network.name} to chain Other: ${tx.hash}`);
    } catch (error) {
        console.error('Error minting tokens:', error);
        return;
    }

    try {
        let tx = await myOFTTo
            .connect(walletTo)
            .setPeer(configFrom.lzId, ethers.utils.zeroPad(myOFTAdapterFrom.address, 32));
        await tx.wait();
        console.log(`Set peer for myOFTTo to chain Other: ${tx.hash}`);
    } catch (error) {
        console.error('Error minting tokens:', error);
        return;
    }

    const initialAmount = ethers.utils.parseEther('100');
    await myERC.mint(configFrom.address, initialAmount);

    const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString();

    const sendParam = [
        configTo.lzId,
        ethers.utils.zeroPad(configTo.address, 32),
        tokensToSend,
        tokensToSend,
        options,
        '0x',
        '0x',
    ];

    const [nativeFee] = await myOFTAdapterFrom.quoteSend(sendParam, false);

    try {
        let approveTx = await myERC.approve(myOFTAdapterFrom.address, tokensToSend);
        await approveTx.wait();
        console.log(`Approval transaction hash: ${approveTx.hash}`);
    } catch (error) {
        console.error('Error during token approval:', error);
        return;
    }

    try {
        let sendTx = await myOFTAdapterFrom.send(sendParam, [nativeFee, 0], configFrom.address, {
            value: nativeFee,
        });
        await sendTx.wait();
        console.log(`Token transfer transaction hash: ${sendTx.hash}`);
    } catch (error) {
        console.error('Sending Token Errors:', error);
        return;
    }

    const finalBalanceFrom = await myERC.balanceOf(configFrom.address);
    const finalBalanceAdapter = await myERC.balanceOf(myOFTAdapterFrom.address);
    const finalBalanceTo = await myOFTTo.balanceOf(configTo.address);

    console.log(`final balance of sender on ${networkFrom} : ${ethers.utils.formatEther(finalBalanceFrom)}`);
    console.log(`final balance of Adapter on ${networkFrom}: ${ethers.utils.formatEther(finalBalanceAdapter)}`);
    console.log(`final balance of Receiver on ${networkTo}: ${ethers.utils.formatEther(finalBalanceTo)}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error during deployment:', error);
        process.exit(1);
    });
```

### Running the Script
To run the cross-chain transfer script:

1. Ensure the `.env` file is properly set up with the necessary private keys and contract addresses for both Sepolia and Holesky.
2. Use Hardhat to run the script with the desired network:

   ```bash
   npx hardhat run scripts/sendFTviaAdaptor.js --network <network-name>
   ```

Replace `<network-name>` with either `sepolia` or `holesky`.

## Configuration
- Ensure you set up the appropriate network configurations in `hardhat.config.js`.
- Update the LayerZero endpoint addresses and chain IDs as needed.

## License
This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.

## Acknowledgements
- [LayerZero](https://layerzero.network) for providing cross-chain messaging protocols.
- [OpenZeppelin](https://openzeppelin.com) for secure smart contract templates.
