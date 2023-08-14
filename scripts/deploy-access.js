const { ethers } = require("hardhat");



async function main() {

  const [deployer] = await ethers.getSigners();
  console.log("Deploying account:", await deployer.getAddress());


  const AccessStorage = await ethers.getContractFactory("AccessStorage");
  const accessStorage = await AccessStorage.connect(deployer).deploy("Wild Life");
  await accessStorage.waitForDeployment()


  console.log("Access Storage Contract Address:", accessStorage.target);


  const contractOwner = await accessStorage.owner();
  console.log(`Access Storage Contract Owner: ${contractOwner}`);

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