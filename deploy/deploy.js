const assert = require('assert');
const hre = require('hardhat');

async function main() {
    const { getNamedAccounts, deployments } = hre;
    const contractName = 'MyOFT';
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    assert(deployer, 'Missing named deployer account');

    console.log(`Network: ${hre.network.name}`);
    console.log(`Deployer: ${deployer}`);

    const { name, symbol, lzEndpointAddress, delegate } = hre.network.config.deployment;
    console.log(name, symbol, lzEndpointAddress, delegate);

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [
            name, // name
            symbol, // symbol
            lzEndpointAddress, // LayerZero's EndpointV2 address
            delegate, // owner
        ],
        log: true,
        skipIfAlreadyDeployed: false,
    });
    console.log(`Deployed contract: ${contractName}, Contarct address: ${address}`);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error during deployment:', error);
        process.exit(1);
    });
