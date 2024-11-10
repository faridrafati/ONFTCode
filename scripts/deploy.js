const hre = require("hardhat");

async function main() {
  const { network } = hre;
  console.log(`Deploying to network: ${network.name}`);

  // Extract deployment configuration from network config
  const { name, symbol, minGasToTransfer, lzEndpointAddress, chainID } =
    network.config.deployment;

  // Get contract factory for deploying the contract
  const ONFT721 = await hre.ethers.getContractFactory("HoleskyLz");

  // Deploy the contract
  const onft721 = await ONFT721.deploy(
    name,
    symbol,
    minGasToTransfer,
    lzEndpointAddress,
    chainID
  );

  // Wait for the deployment to complete
  await onft721.waitForDeployment();

  // Retrieve the deployed contract address
  console.log("Contract successfully deployed!");
  console.log("Contract address:", onft721.target);
  console.log(`lzEndpoint: ${lzEndpointAddress}, chainId: ${chainID}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });
