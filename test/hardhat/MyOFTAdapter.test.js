const { expect } = require('chai');
const { Contract, ContractFactory } = require('ethers');
const { deployments, ethers } = require('hardhat');
const { Options } = require('@layerzerolabs/lz-v2-utilities');

describe('MyOFTAdapter Test', function () {
    // Constant representing a mock Endpoint ID for testing purposes
    const eidA = 1;
    const eidB = 2;
    // Declaration of variables to be used in the test suite
    let MyOFTAdapter;
    let MyOFT;
    let ERC20Mock;
    let EndpointV2Mock;
    let ownerA;
    let ownerB;
    let endpointOwner;
    let token;
    let myOFTAdapter;
    let myOFTB;
    let mockEndpointV2A;
    let mockEndpointV2B;

    // Before hook for setup that runs once before all tests in the block
    before(async function () {
        // Contract factory for our tested contract
        MyOFTAdapter = await ethers.getContractFactory('MyOFTAdapter');

        MyOFT = await ethers.getContractFactory('MyOFT');

        ERC20Mock = await ethers.getContractFactory('MyERC20');

        // Fetching the first three signers (accounts) from Hardhat's local Ethereum network
        const signers = await ethers.getSigners();

        ownerA = signers[0];
        ownerB = signers[1];
        endpointOwner = signers[2];

        // The EndpointV2Mock contract comes from @layerzerolabs/test-devtools-evm-hardhat package
        // and its artifacts are connected as external artifacts to this project
        const EndpointV2MockArtifact = await deployments.getArtifact('EndpointV2Mock');

        EndpointV2Mock = new ContractFactory(
            EndpointV2MockArtifact.abi,
            EndpointV2MockArtifact.bytecode,
            endpointOwner
        );
    });

    // beforeEach hook for setup that runs before each test in the block
    beforeEach(async function () {
        // Deploying a mock LZEndpoint with the given Endpoint ID
        mockEndpointV2A = await EndpointV2Mock.deploy(eidA);
        mockEndpointV2B = await EndpointV2Mock.deploy(eidB);

        token = await ERC20Mock.deploy('Token', 'TOKEN');

        // Deploying two instances of MyOFT contract with different identifiers and linking them to the mock LZEndpoint
        myOFTAdapter = await MyOFTAdapter.deploy(token.address, mockEndpointV2A.address, ownerA.address);
        myOFTB = await MyOFT.deploy('bOFT', 'bOFT', mockEndpointV2B.address, ownerB.address);

        // Setting destination endpoints in the LZEndpoint mock for each MyOFT instance
        await mockEndpointV2A.setDestLzEndpoint(myOFTB.address, mockEndpointV2B.address);
        await mockEndpointV2B.setDestLzEndpoint(myOFTAdapter.address, mockEndpointV2A.address);

        // Setting each MyOFT instance as a peer of the other in the mock LZEndpoint
        await myOFTAdapter.connect(ownerA).setPeer(eidB, ethers.utils.zeroPad(myOFTB.address, 32));
        await myOFTB.connect(ownerB).setPeer(eidA, ethers.utils.zeroPad(myOFTAdapter.address, 32));
    });

    // A test case to verify token transfer functionality
    it('should send a token from A address to B address via OFTAdapter/OFT', async function () {
        // Minting an initial amount of tokens to ownerA's address in the myOFTA contract
        const initialAmount = ethers.utils.parseEther('100');
        await token.mint(ownerA.address, initialAmount);

        // Defining the amount of tokens to send and constructing the parameters for the send operation
        const tokensToSend = ethers.utils.parseEther('1');

        // Defining extra message execution options for the send operation
        const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString();

        const sendParam = [
            eidB,
            ethers.utils.zeroPad(ownerB.address, 32),
            tokensToSend,
            tokensToSend,
            options,
            '0x',
            '0x',
        ];

        // Fetching the native fee for the token send operation
        const [nativeFee] = await myOFTAdapter.quoteSend(sendParam, false);

        // Approving the native fee to be spent by the myOFTA contract
        await token.connect(ownerA).approve(myOFTAdapter.address, tokensToSend);

        // Executing the send operation from myOFTA contract
        await myOFTAdapter.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee });

        // Fetching the final token balances of ownerA and ownerB
        const finalBalanceA = await token.balanceOf(ownerA.address);
        const finalBalanceAdapter = await token.balanceOf(myOFTAdapter.address);
        const finalBalanceB = await myOFTB.balanceOf(ownerB.address);

        // Asserting that the final balances are as expected after the send operation
        expect(finalBalanceA).to.eql(initialAmount.sub(tokensToSend));
        expect(finalBalanceAdapter).to.eql(tokensToSend);
        expect(finalBalanceB).to.eql(tokensToSend);
    });
});
