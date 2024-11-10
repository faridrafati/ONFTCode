const { ethers } = require("ethers");
const hardhat = require("hardhat");
const fs = require("fs").promises;

async function main() {
  const { network } = hre;
  console.log("Creating Token on: ", network.name);
  let contractAddress, privateKey, tokenID;
  if (network.name == "sepolia") {
    contractAddress = process.env.SEPOLIA_CONTRACT_ADDRESS;
    privateKey = process.env.PRIVATE_KEY_SEPOLIA;
    tokenID = "sepoliaURI";
  } else if (network.name == "holesky") {
    contractAddress = process.env.HOLESKY_CONTRACT_ADDRESS;
    privateKey = process.env.PRIVATE_KEY_HOLESKY;
    tokenID = "holeskyURI";
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
  provider = new hardhat.ethers.JsonRpcProvider(network.config.url);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  try {
    // Send the transaction with a value if the function requires a payable value
    const tx = await contract.createToken(tokenID, 1000000);
    await tx.wait(); // Wait for transaction to be mined

    console.log("Token created successfully, transaction hash:", tx.hash);
  } catch (error) {
    console.error("Error creating token:", error);
  }
  try {
    const owner = await contract.symbol();
    console.log("The symbol of the contract is:", owner);
  } catch (error) {
    console.error("Error fetching the owner:", error);
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
