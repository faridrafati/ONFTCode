const assert = require('assert');
const hre = require('hardhat');

async function main() {
    const { getNamedAccounts, deployments } = hre;
    const contractName = 'MyERC20';
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    assert(deployer, 'Missing named deployer account');

    console.log(`Network: ${hre.network.name}`);
    console.log(`Deployer: ${deployer}`);

    const { name, symbol } = hre.network.config.TokenDeployment;
    console.log(name, symbol);

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [
            name, // name
            symbol, // symbol
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
