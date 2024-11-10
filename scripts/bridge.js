const { ethers } = require("ethers");
const hardhat = require("hardhat");
const fs = require("fs").promises;

const bridgeNft = async (chainToBridge, tokenid, contract, wallet) => {
  let _dstChain = chainToBridge;
  let _tokenId = tokenid;

  const signerAddress = wallet.address;

  const bytesAddress = ethers.utils.arrayify(signerAddress);

  let EstimateAdapter = ethers.utils.solidityPack(
    ["uint16", "uint"],
    [1, 350000]
  );

  const [nativeFee, zroFee] = await contract.estimateSendFee(
    _dstChain, //uint16
    bytesAddress, //bytes
    _tokenId, //uint
    false, //bool
    EstimateAdapter //bytes
  );
  nativeFee = 100000000000000;

  const nativeFeeInEther = ethers.utils.formatEther(nativeFee);

  const lzCommissionInWei = ethers.utils.parseEther(
    nativeFeeInEther.toString()
  );

  const addPrice = 0.00003;
  const addPriceInWei = ethers.utils.parseEther(addPrice.toString());

  const appPriceInEther = 0.0001;
  const listingPriceInWei = ethers.utils.parseEther(appPriceInEther.toString());

  let adapter = ethers.utils.solidityPack(["uint16", "uint"], [1, 350000]);

  const transaction = await contract.sendOnft(chainToBridge, tokenid, adapter, {
    value: listingPriceInWei.add(lzCommissionInWei).add(addPriceInWei),
  });

  await transaction.wait();
};

async function main() {
  const { network } = hardhat;
  console.log("bridge from: ", network.name);
  let contractAddress, privateKey;
  if (network.name == "sepolia") {
    contractAddress = process.env.SEPOLIA_CONTRACT_ADDRESS;
    privateKey = process.env.PRIVATE_KEY_SEPOLIA;
  } else if (network.name == "holesky") {
    contractAddress = process.env.HOLESKY_CONTRACT_ADDRESS;
    privateKey = process.env.PRIVATE_KEY_HOLESKY;
  }
  const abiPath = "abi.json"; // Path to your ABI file
  let abi;
  try {
    const data = await fs.readFile(abiPath, "utf8");
    abi = JSON.parse(data);
  } catch (err) {
    console.error("Error reading ABI:", err);
    return; // Exit if there's an error with reading the ABI
  }
  let provider;
  if (!privateKey) {
    console.error("Private key not set. Please set PRIVATE_KEY.");
    return;
  }
  provider = new ethers.providers.JsonRpcProvider(network.config.url);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  await bridgeNft(40161, 6637176, contract, wallet);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });
