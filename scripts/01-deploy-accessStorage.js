const { ethers } = require("hardhat");

// Access Storage Contract Address: 0x05f74B54292d5065f8062e9fC77ceE1cE06bCC85
// Owner Donation Transaction: 0xc581f45584808915b64c618ddab69f87b1ab3737491646c567471db7b0d766ac

// 0x131522ec072Bd4BF40039EE1a572A54b94Bfc0C8

async function main() {

  const [owner] = await ethers.getSigners();

  const AccessStorageContract = await ethers.getContractFactory("AccessStorage");
  const accessStorage = await AccessStorageContract.deploy()
  console.log("Access Storage Contract Address:", await accessStorage.getAddress());


  const ownerDonation = await accessStorage.connect(owner).donate({ value: ethers.parseUnits("0.05", "ether") });
  console.log("Owner Donation Transaction:", ownerDonation.hash);

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