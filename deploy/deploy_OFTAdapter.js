const assert = require('assert');
const hre = require('hardhat');

async function main() {
    const { getNamedAccounts, deployments } = hre;
    const contractName = 'MyOFTAdapter';
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    assert(deployer, 'Missing named deployer account');

    console.log(`Network: ${hre.network.name}`);
    console.log(`Deployer: ${deployer}`);

    const { tokenAddress, lzEndpointAddress, owner } = hre.network.config.AdapterDeployment;
    console.log(tokenAddress, lzEndpointAddress, owner);

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [
            tokenAddress, // token address
            lzEndpointAddress, // LayerZero's EndpointV2 address
            owner, // owner
        ],
        log: true,
        skipIfAlreadyDeployed: false,
    });

    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error during deployment:', error);
        process.exit(1);
    });
