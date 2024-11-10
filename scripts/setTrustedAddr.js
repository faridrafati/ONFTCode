const hre = require("hardhat");

async function main() {
  const { network } = hre;
  const [deployer] = await hre.ethers.getSigners();
  const SEPOLIA_ID = 40161;
  const HOLESKY_ID = 40217;

  const contractAddressSepolia = process.env.SEPOLIA_CONTRACT_ADDRESS;
  const contractAddressHolesky = process.env.HOLESKY_CONTRACT_ADDRESS;

  //SET TRUSTED REMOTE ADDRESS
  try {
    console.log(`Connecting to the ${network.name} contract...`);
    let getTrustedRemote;
    //Sepolia
    if (network.name == "sepolia") {
      const CONTRACT_SEPOLIA = await hre.ethers.getContractAt(
        "HoleskyLz",
        contractAddressSepolia
      );
      const txSep = await CONTRACT_SEPOLIA.setTrustedRemoteAddress(
        HOLESKY_ID,
        contractAddressHolesky
      );
      console.log("Transaction sent. Waiting for confirmation...");
      let receipt = await txSep.wait(1);
      console.log("Transaction confirmed:", receipt.hash);
      getTrustedRemote = await CONTRACT_SEPOLIA.getTrustedRemoteAddress(
        HOLESKY_ID
      );
    }

    //Holesky
    if (network.name == "holesky") {
      const CONTRACT_HOLESKY = await hre.ethers.getContractAt(
        "HoleskyLz",
        contractAddressHolesky
      );
      const txHol = await CONTRACT_HOLESKY.setTrustedRemoteAddress(
        SEPOLIA_ID,
        contractAddressSepolia
      );
      console.log("Transaction sent. Waiting for confirmation...");
      let receipt = await txHol.wait(1);
      console.log("Transaction confirmed:", receipt.hash);
      getTrustedRemote = await CONTRACT_HOLESKY.getTrustedRemoteAddress(
        SEPOLIA_ID
      );
    }

    console.log(getTrustedRemote);
  } catch (error) {
    console.error("Error setting trusted remote address: ", error);
  }
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
