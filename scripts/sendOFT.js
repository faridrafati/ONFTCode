// Importing the ethers.js library for interacting with the Ethereum blockchain
const { ethers } = require('ethers');

// Importing the promises API of the fs module for file operations
const fs = require('fs').promises;

// Importing Options from LayerZero utilities for cross-chain messaging options
const { Options } = require('@layerzerolabs/lz-v2-utilities');

// Importing the network object from Hardhat for accessing the active network name
const { network } = require('hardhat');

// Function to retrieve configuration settings based on the specified network
function getConfig(network) {
    if (network === 'Sepolia') {
        return {
            privateKey: process.env.PRIVATE_KEY_SEPOLIA, // Private key for the Sepolia network
            address: process.env.ADDRESS_SEPOLIA, // Wallet address on Sepolia
            contractAddress: process.env.SEPOLIA_CONTRACT_ADDRESS, // Deployed contract address on Sepolia
            rpcUrl: process.env.SEPOLIA_URL, // RPC URL for connecting to Sepolia
            chainId: parseInt(process.env.SEPOLIA_CHAINID, 10), // Chain ID for Sepolia network
            lzEndAddress: process.env.SEPOLIA_LZ_END_ADDRESS, // LayerZero endpoint address on Sepolia
            lzId: parseInt(process.env.SEPOLIA_LZID, 10), // LayerZero chain ID for Sepolia
        };
    } else if (network === 'Holesky') {
        return {
            privateKey: process.env.PRIVATE_KEY_HOLESKY, // Private key for the Holesky network
            address: process.env.ADDRESS_HOLESKY, // Wallet address on Holesky
            contractAddress: process.env.HOLESKY_CONTRACT_ADDRESS, // Deployed contract address on Holesky
            rpcUrl: process.env.HOLESKY_URL, // RPC URL for connecting to Holesky
            chainId: parseInt(process.env.HOLESKY_CHAINID, 10), // Chain ID for Holesky network
            lzEndAddress: process.env.HOLESKY_LZ_END_ADDRESS, // LayerZero endpoint address on Holesky
            lzId: parseInt(process.env.HOLESKY_LZID, 10), // LayerZero chain ID for Holesky
        };
    } else {
        throw new Error('Invalid chain specified. Use "Sepolia" or "Holesky".'); // Error for unsupported networks
    }
}

async function main() {
    // Load the contract's ABI (Application Binary Interface) from a JSON file
    const abi = JSON.parse(await fs.readFile('abi.json', 'utf8'));

    // Variables to hold the names of the current and target networks
    let networkA;
    let networkB;

    // Determine the active network and assign the corresponding network names
    if (network.name === 'sepolia') {
        networkA = 'Sepolia'; // Active network is Sepolia
        networkB = 'Holesky'; // Target network is Holesky
    } else if (network.name === 'holesky') {
        networkA = 'Holesky'; // Active network is Holesky
        networkB = 'Sepolia'; // Target network is Sepolia
    } else {
        throw new Error('Unsupported network. Use "sepolia" or "holesky".'); // Error for unsupported networks
    }

    // Retrieve configuration settings for both networks
    const configA = getConfig(networkA); // Config for the active network
    const configB = getConfig(networkB); // Config for the target network

    // Create JSON-RPC providers for both networks using their RPC URLs
    providerA = new ethers.providers.JsonRpcProvider(configA.rpcUrl);
    providerB = new ethers.providers.JsonRpcProvider(configB.rpcUrl);

    // Create wallet instances by connecting private keys with their respective providers
    const walletA = new ethers.Wallet(configA.privateKey, providerA);
    const walletB = new ethers.Wallet(configB.privateKey, providerB);

    // Create contract instances for interacting with the deployed contracts on both networks
    const myOFTA = new ethers.Contract(configA.contractAddress, abi, walletA); // Contract on networkA
    const myOFTB = new ethers.Contract(configB.contractAddress, abi, walletB); // Contract on networkB

    // Set the peer contract address on the active network to enable cross-chain interactions
    try {
        let tx = await myOFTA.setPeer(
            configB.lzId, // LayerZero chain ID of the target network
            ethers.utils.zeroPad(configB.contractAddress, 32) // Padded contract address on the target network
        );
        await tx.wait(); // Wait for the transaction to be mined
        console.log(`Set peer for MyOFT ${network.name} to chain Other: ${tx.hash}`); // Log the transaction hash
    } catch (error) {
        console.error('Error minting tokens:', error); // Log any errors that occur during minting
    }

    // Mint an initial amount of tokens to the wallet address on the active network
    const initialAmount = ethers.utils.parseEther('100'); // Amount to mint (100 tokens)
    try {
        const tx = await myOFTA.mint(configA.address, initialAmount); // Mint tokens to the wallet address
        console.log('Minting is successful:', tx.hash); // Log success message with transaction hash
    } catch (error) {
        console.error('Error minting tokens:', error); // Log any errors that occur during minting
    }

    // Retrieve and log the initial token balances on both networks
    let BalanceA = await myOFTA.balanceOf(configA.address); // Balance on the active network
    let BalanceB = await myOFTB.balanceOf(configB.address); // Balance on the target network
    console.log(`Initial Sender Balance: ${BalanceA}, Initial Receiver Balance: ${BalanceB}`);

    // Define the amount of tokens to send in the cross-chain transfer
    const tokensToSend = ethers.utils.parseEther('1'); // Sending 1 token

    // Define additional execution options for the cross-chain message
    const options = Options.newOptions()
        .addExecutorLzReceiveOption(200000, 0) // Set gas limit and zero additional parameters
        .toHex()
        .toString(); // Convert options to hexadecimal string

    // Construct the parameters required for the send operation
    const sendParam = [
        configB.lzId, // LayerZero chain ID of the target network
        ethers.utils.zeroPad(configB.address, 32), // Padded receiver address on the target network
        tokensToSend, // Amount of tokens to send
        tokensToSend, // Minimum amount to receive on the target network
        options, // Execution options in hex format
        '0x', // Adapter parameters (empty in this case)
        '0x', // Additional data (empty in this case)
    ];

    // Estimate the native fee required for the cross-chain send operation
    const [nativeFee] = await myOFTA.quoteSend(sendParam, false);

    // Execute the cross-chain send operation
    try {
        let sending = await myOFTA.send(
            sendParam, // Parameters for the send operation
            [nativeFee, 0], // Native fee and zero additional fee
            configA.address, // Refund address for any leftover fees
            { value: nativeFee } // Include the native fee in the transaction
        );
        sending.wait();
    } catch (error) {
        console.error('Sending Token Errors:', error); // Log any errors that occur during minting
    }

    // Retrieve and log the final token balances on both networks after the transfer
    BalanceA = await myOFTA.balanceOf(configA.address); // Updated balance on the active network
    BalanceB = await myOFTB.balanceOf(configB.address); // Updated balance on the target network
    console.log(`Final Sender Balance: ${BalanceA}, Final Receiver Balance: ${BalanceB}`);
}

// Execute the main function and handle any exceptions
main()
    .then(() => process.exit(0)) // Exit the process with code 0 on success
    .catch((error) => {
        console.error('Error during deployment:', error); // Log the error message
        process.exit(1); // Exit the process with code 1 on failure
    });
