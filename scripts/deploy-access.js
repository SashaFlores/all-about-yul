const { ethers } = require("hardhat");



async function main() {

  const [deployer] = await ethers.getSigners();
  console.log("Deploying account:", await deployer.getAddress());


  const AccessContract = await ethers.getContractFactory("AccessStorage");
  const deployedContract = await AccessContract.connect(deployer).deploy("Wild Life");

  deployedContract.waitForDeployment();

  const deployedContractAddress = await deployedContract.getAddress();
  console.log("Access Storage Contract Address:", deployedContractAddress);


  const accessStorage = AccessContract.attach(deployedContractAddress);
  console.log("Access Storage Contract Attached:", await accessStorage.getAddress());

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