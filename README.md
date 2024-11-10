**ONFT Cross-Chain Project with LayerZero**

**Overview**

This project implements an Omnichain Non-Fungible Token (ONFT) that can
be transferred across multiple blockchain networks using
[[LayerZero]{.underline}](https://layerzero.network/). LayerZero is an
interoperability protocol that enables secure and seamless cross-chain
interactions, allowing NFTs to move across different chains while
retaining their unique properties.

**Features**

-   **Cross-Chain NFT Transfer**: Transfer ONFTs between supported
    blockchains with minimal effort.

-   **Interoperability with LayerZero**: Utilize LayerZero\'s protocol
    for secure and efficient communication across chains.

-   **Scalable and Decentralized**: Build decentralized applications
    (DApps) that scale across multiple networks.

**Prerequisites**

Before starting, ensure you have the following installed:

-   [[Node.js]{.underline}](https://nodejs.org/) (version 16 or later)

-   [[Hardhat]{.underline}](https://hardhat.org/) or
    [[Truffle]{.underline}](https://www.trufflesuite.com/)

-   Ethers.js

-   A LayerZero-supported wallet (e.g., MetaMask)

-   [[Solidity]{.underline}](https://soliditylang.org/) compiler

**Installation**

1.  **Clone the Repository:**

> bash
>
> Copy code
>
> git clone
> https://github.com/your-username/ONFT-cross-chain-layerzero.git
>
> cd ONFT-cross-chain-layerzero

2.  **Install Dependencies:**

> bash
>
> Copy code
>
> npm install

3.  **Compile Contracts:**

> bash
>
> Copy code
>
> npx hardhat compile

**Configuration**

1.  **LayerZero Configuration**: Update the network configurations and
    LayerZero endpoint details in hardhat.config.js or your
    configuration file.

2.  **Environment Variables**: Create a .env file and add your private
    keys and RPC URLs:

> ini
>
> Copy code
>
> PRIVATE_KEY=your-private-key
>
> RPC_URL_MAINNET=https://mainnet.infura.io/v3/your-infura-project-id
>
> RPC_URL_TESTNET=https://goerli.infura.io/v3/your-infura-project-id

**Usage**

1.  **Deploy Contracts**: Deploy the smart contract to your desired
    network:

> bash
>
> Copy code
>
> npx hardhat run scripts/deploy.js \--network \<network-name\>

2.  **Transfer ONFTs**: Use the following command or interact with your
    DApp to initiate cross-chain NFT transfers:

> bash
>
> Copy code
>
> node scripts/bridge.js \--network \<source-network\> (note: debugging now)

**Smart Contract Overview**

The main contract, HoleskyLz.sol, inherits from the LayerZero ONFT library to
handle cross-chain communication.

**Key Functions:**

-   createToken(
        string memory tokenURI,
        uint256 price
    ): Creating a new ONFT
    address.

- function sendOnft(uint16 destChainId,uint256 tokenId,bytes memory adapter,uint256 sendValue) :  Transfers the specified ONFT to another chain.

**Events:**

-   event TokenCreated(
        uint256 indexed tokenId,
        address indexed owner,
        string tokenURI,
        uint256 price
    );
-   event MarketSale(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 saleValue
    );
-   event TokenSent(
        uint256 indexed tokenId,
        address indexed sender,
        uint16 indexed dstChainId,
        string tokenURI
    );
-   event TokenReceived(
        uint256 indexed tokenId,
        address indexed sender,
        string tokenURI
    );
-   event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );
-   event LzReceive(bytes indexed payload);

**Supported Networks**

This project is configured to support the following networks (expand as
needed):

-   Ethereum Sepolia Testnet

-   Polygon

-   Binance Smart Chain (BSC)

-   Avalanche

-   Holesky Sepolia Testnet

**Resources**

-   LayerZero Documentation

-   OpenZeppelin Contracts

-   Ethers.js Documentation

**Contributing**

Contributions are welcome! Please fork this repository and submit a pull
request for any improvements or fixes.

**License**

This project is licensed under the MIT License. See the LICENSE file for
details.

**Contact**

For questions or support, please reach out via faridrafati@gmail.com or open an issue in
this repository.
