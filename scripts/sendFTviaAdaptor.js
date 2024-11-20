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
    console.log(`Initial balance of Reciever on ${networkTo}: ${ethers.utils.formatEther(initialBalanceTo)}`);

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
        console.error('Sending Token Errors:', error); // Log any errors that occur during minting
        return;
    }

    const finalBalanceFrom = await myERC.balanceOf(configFrom.address);
    const finalBalanceAdapter = await myERC.balanceOf(myOFTAdapterFrom.address);
    const finalBalanceTo = await myOFTTo.balanceOf(configTo.address);

    console.log(`final balance of sender on ${networkFrom} : ${ethers.utils.formatEther(finalBalanceFrom)}`);
    console.log(`final balance of Adapter on ${networkFrom}: ${ethers.utils.formatEther(finalBalanceAdapter)}`);
    console.log(`final balance of Reciever on ${networkTo}: ${ethers.utils.formatEther(finalBalanceTo)}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error during deployment:', error);
        process.exit(1);
    });
