const { ethers } = require("hardhat");
const { expect } = require("chai");


const ADDRESS_ZERO = ethers.AddressZero;
const EXCEED_MAX = ethers.parseEther("6");
const ZERO_DONATION = ethers.parseUnits("0")


describe("Access Storage Test", function () {
    let accessStorage, owner, donor1, ownerAddress, donor1Address, donorsArray, contractAddress, provider

    before("setup", async () => {
   
        provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_SEPOLIA_API_KEY}`);
        
        owner = new ethers.Wallet(process.env.PRIVATE_KEY_ONE, provider);
        ownerAddress = await owner.getAddress();

        donor1 = new ethers.Wallet(process.env.PRIVATE_KEY_TWO, provider);
        donor1Address = await donor1.getAddress();

        // donor2 = new ethers.Wallet(process.env.PRIVATE_KEY_THREE, provider);
        // donor2Address = await donor2.getAddress();

        contractAddress = "0x05f74B54292d5065f8062e9fC77ceE1cE06bCC85";
        const accessStorageArtifact = await artifacts.readArtifact("AccessStorage");
        const abi = accessStorageArtifact.abi;
        accessStorage = new ethers.Contract(contractAddress, abi, provider);

        donorsArray = await accessStorage.getAllDonors();
    
    })
    describe("deployment data", function () {
        it("owner is the deployer", async () => {
            expect(await accessStorage.owner()).to.equal(ownerAddress)
        })
        it("initial deposit by owner", async () => {
            const ownerDonation = ethers.parseEther("0.05");

            expect(await accessStorage.totalDonations()).to.equal(ownerDonation)
        })
        it("owner is the only donor", async () => {
            expect(await accessStorage.totalDonors()).to.equal(1)
            
            expect(await accessStorage.getAllDonors()).to.include(ownerAddress);

            expect(donorsArray.length).to.equal(1);

            expect(donorsArray[0]).to.equal(ownerAddress)
        })
        it("rejects donations greater than max donation", async () => {

            expect(accessStorage.donate({ value: EXCEED_MAX }))
            .to.be.revertedWithCustomError(accessStorage, "ExceedDonations")
        })
    })
    describe("first donor's donation", function () {
        it("process donation from donor1", async () => {
            const donation = ethers.parseUnits("20", "gwei");
            const donateTx = await accessStorage.connect(donor1).donate({ value: donation})
            const receipt = await donateTx.wait();
          
            console.log(`First Donation hash is: ${receipt.hash}`)  //0x7da1122c42ede691bb1d230ab993b383abbd28f2cafa6cd8095caf9cf16c6cc0
        })
    })
    describe("sanity checks of first donation", function () {
        it("rejects address zero", async () => {
       
            expect(accessStorage.connect(ADDRESS_ZERO).donate({ value: ethers.parseUnits("20", "gwei")}))
            .to.revertedWithCustomError(accessStorage, "AddressZero")
        })
        it("total donors should be two", async () => {
            expect(await accessStorage.totalDonors()).to.equal(2)
        })
        it("update donors array", async () => {
            expect(donorsArray.length).to.equal(2);

            expect(donorsArray[1]).to.equal(donor1Address)
        })
        it("donation should be greater than zero", async () => {
            expect(accessStorage.donate({ value: ZERO_DONATION }))
            .to.revertedWithCustomError(accessStorage, "ZeroDonation")
        })
        it("update total donations received", async () => {
            const ownerDonation = ethers.parseEther("0.05");
            const firstDonation = ethers.parseUnits("20", "gwei");
            const sumDonations = ownerDonation + firstDonation;

            expect(await accessStorage.totalDonations()).to.equal(sumDonations)
        })
    })
    describe("access variables storage index", function () {
        it("get _balances mapping values", async () => {
            // owner:  0x7FfdD2c05C3760A5Bcb10c39ac5bF55702ebcc43
            const padded = ethers.zeroPadValue(ownerAddress, 32)    // key padded
            console.log(`bytes32 representation: ${padded}`)
     
            const slotIndex = ethers.solidityPacked(["uint256"], [0])   //slot index
            console.log(`Slot Index 0: ${slotIndex}`)
        
            const combineKeyData = ethers.concat([padded, slotIndex])   // key + slot index
            console.log(`concatenated Data: ${combineKeyData}`)

            const keyHash = ethers.keccak256(combineKeyData)    // storage location of owner's key
            console.log(`Hash of Key: ${keyHash}`)
      
            const ownerDonation = await provider.getStorage(contractAddress, keyHash)
            console.log(`owner's donation is: ${ownerDonation}`) 

            const allDonations = await accessStorage.totalDonations()
            console.log(`total donations: ${allDonations}`)

            // const value = ethers.getUint(ownerDonation)
            // console.log(`owner's donation is: ${value}`)
    
            
            

        })
    })

})

// 0000000000000000000000007FfdD2c05C3760A5Bcb10c39ac5bF55702ebcc43
// 0x0000000000000000000000000000000000000000000000000000000000000000
// 0x0000000000000000000000000000000000000000000000000000000000000000

// 0000000000000000000000007ffdd2c05c3760a5bcb10c39ac5bf55702ebcc43
// 0000000000000000000000000000000000000000000000000000000000000000

// 0000000000000000000000007ffdd2c05c3760a5bcb10c39ac5bf55702ebcc430000000000000000000000000000000000000000000000000000000000000000
// 0000000000000000000000006827b8f6cc60497d9bf5210d602c0ecafdf7c4050000000000000000000000000000000000000000000000000000000000000000

// 0xf3419a4c0a451fede652d28139583576829d3966d1986bc40eb6fdc4373d347b
// 0x86dfc0930cb222883cc0138873d68c1c9864fc2fe59d208c17f3484f489bef04

// 0000000000000000000000007FfdD2c05C3760A5Bcb10c39ac5bF55702ebcc430000000000000000000000000000000000000000000000000000000000000000 : 
// 53108d1ba3b09bfd051b0769c4c243fbfa6d6ad55ac7f6b49f5019ea6fa0dfbb
// 0000000000000000000000006827b8f6cc60497d9bf5210d602c0ecafdf7c4050000000000000000000000000000000000000000000000000000000000000000 :
// 86dfc0930cb222883cc0138873d68c1c9864fc2fe59d208c17f3484f489bef04

// 0x53108d1ba3b09bfd051b0769c4c243fbfa6d6ad55ac7f6b49f5019ea6fa0dfbb
// 0X53108d1ba3b09bfd051b0769c4c243fbfa6d6ad55ac7f6b49f5019ea6fa0dfbb

