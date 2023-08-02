const { ethers } = require("hardhat")

const ZERO_ADDRESS = ethers.constants.AddressZero


async function main() {
  const [owner]  = await ethers.getSigners()
  console.log(`Contract Owner: ${owner.getAddress()}`);

  const AccessStorageContract = await ethers.getContractFactor('AccessStorage');
  const accessStorage = await AccessStorageContract.deploy();
  await accessStorage.deployed();
  console.log(`Access Storage Contract Address: ${accessStorage.address}`);

    

}
main()
  .then(() => {
    console.log("\nDeployment completed successfully ✓");
    process.exit(0);
  })
  .catch((error) => {
    console.log("\nDeployment failed ✗");
    console.error(error);
    process.exit(1);
  });