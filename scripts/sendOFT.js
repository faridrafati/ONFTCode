const { ethers } = require('ethers');
const fs = require('fs').promises;

const { Options } = require('@layerzerolabs/lz-v2-utilities');
const { network } = require('hardhat');

function getConfig(network) {
    if (network === 'Sepolia') {
        return {
            privateKey: process.env.PRIVATE_KEY_SEPOLIA,
            address: process.env.ADDRESS_SEPOLIA,
            contractAddress: process.env.SEPOLIA_CONTRACT_ADDRESS,
            rpcUrl: process.env.SEPOLIA_URL,
            chainId: parseInt(process.env.SEPOLIA_CHAINID, 10),
            lzEndAddress: process.env.SEPOLIA_LZ_END_ADDRESS,
            lzId: parseInt(process.env.SEPOLIA_LZID, 10),
        };
    } else if (network === 'Holesky') {
        return {
            privateKey: process.env.PRIVATE_KEY_HOLESKY,
            address: process.env.ADDRESS_HOLESKY,
            contractAddress: process.env.HOLESKY_CONTRACT_ADDRESS,
            rpcUrl: process.env.HOLESKY_URL,
            chainId: parseInt(process.env.HOLESKY_CHAINID, 10),
            lzEndAddress: process.env.HOLESKY_LZ_END_ADDRESS,
            lzId: parseInt(process.env.HOLESKY_LZID, 10),
        };
    } else {
        throw new Error('Invalid chain specified. Use "Sepolia" or "Holesky".');
    }
}

async function main() {
    // Load the ABI
    const abi = JSON.parse(await fs.readFile('abi.json', 'utf8'));

    // Declaration of networkA and networkB in a wider scope
    let networkA;
    let networkB;

    // Assign values to networkA and networkB based on the active network
    if (network.name === 'sepolia') {
        networkA = 'Sepolia';
        networkB = 'Holesky';
    } else if (network.name === 'holesky') {
        networkA = 'Holesky';
        networkB = 'Sepolia';
    } else {
        throw new Error('Unsupported network. Use "sepolia" or "holesky".');
    }

    // Get the configurations for both networks
    const configA = getConfig(networkA);
    const configB = getConfig(networkB);

    providerA = new ethers.providers.JsonRpcProvider(configA.rpcUrl);
    providerB = new ethers.providers.JsonRpcProvider(configB.rpcUrl);

    const walletA = new ethers.Wallet(configA.privateKey, providerA);
    const walletB = new ethers.Wallet(configB.privateKey, providerB);

    const myOFTA = new ethers.Contract(configA.contractAddress, abi, walletA);
    const myOFTB = new ethers.Contract(configB.contractAddress, abi, walletB);

    let txA = await myOFTA.setPeer(configB.lzId, ethers.utils.zeroPad(configB.contractAddress, 32));
    await txA.wait();
    console.log(`Set peer for MyOFT ${network.name} to chain Other: ${txA.hash}`);

    // Minting an initial amount of tokens to ownerA's address in the myOFTA contract
    const initialAmount = ethers.utils.parseEther('100');
    try {
        const tx = await myOFTA.mint(configA.address, initialAmount);
        console.log('minting is successful:', tx.hash);
    } catch (error) {
        console.error('Error minting tokens:', error);
    }
    let BalanceA = await myOFTA.balanceOf(configA.address);
    let BalanceB = await myOFTB.balanceOf(configB.address);
    console.log(`Initial Sender Balance: ${BalanceA}, Initial Reciever Balance: ${BalanceB}`);
    // Defining the amount of tokens to send and constructing the parameters for the send operation
    const tokensToSend = ethers.utils.parseEther('1');

    // Defining extra message execution options for the send operation
    const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString();

    const sendParam = [
        configB.lzId,
        ethers.utils.zeroPad(configB.address, 32),
        tokensToSend,
        tokensToSend,
        options,
        '0x',
        '0x',
    ];

    // Fetching the native fee for the token send operation
    const [nativeFee] = await myOFTA.quoteSend(sendParam, false);

    // Executing the send operation from myOFTA contract
    await myOFTA.send(sendParam, [nativeFee, 0], configA.address, { value: nativeFee });

    // Fetching the final token balances of ownerA and ownerB
    const finalBalanceA = await myOFTA.balanceOf(configA.address);
    BalanceA = await myOFTA.balanceOf(configA.address);
    BalanceB = await myOFTB.balanceOf(configB.address);
    console.log(`Final Sender Balance: ${BalanceA}, Final Reciever Balance: ${BalanceB}`);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error during deployment:', error);
        process.exit(1);
    });
