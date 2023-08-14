const { ethers } = require("hardhat");
const { expect } = require("chai");


const ADDRESS_ZERO = ethers.AddressZero;
const EXCEED_MAX = ethers.parseEther("6");
const ZERO_DONATION = ethers.parseUnits("0")


const contractAddress = "0x7093Dc313b81BD5a541a2b41A307C9a0a35b9F32";
let donorsArray = []

describe("Access Storage Test", function () {
    let accessStorage, owner, donor, ownerAddress, donorAddress

    beforeEach("setup", async () => {

        provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_SEPOLIA_API_KEY}`);
        
        owner = new ethers.Wallet(process.env.PRIVATE_KEY_OWNER, provider);
        ownerAddress = await owner.getAddress();

        donor = new ethers.Wallet(process.env.PRIVATE_KEY_DONOR, provider);
        donorAddress = await donor.getAddress();
 
        const accessStorageArtifact = await artifacts.readArtifact("AccessStorage");
        const abi = accessStorageArtifact.abi;
        try {
            accessStorage = new ethers.Contract(contractAddress, abi, provider);
        } catch (error) {
            console.error("Error creating accessStorage instance:", error);
        }
        
        donorsArray = await accessStorage.getAllDonors()
    })

    describe("owner donation test", function () {
        before(async () => {
            ownerDonation = ethers.parseEther("0.05");
        })

        it("owner donation", async () => {
            console.log(`Array length is: ${donorsArray.length}`);
            const donateTx = await accessStorage.connect(owner).donate({ value: ownerDonation });
            const receipt = await donateTx.wait();
            console.log(`First Donation hash is: ${receipt.hash}`);
        })
        it("donors array should include owner address only", async () => {
 
            console.log(`Array length is: ${donorsArray.length}`);
    
            expect(donorsArray.length).to.equal(1);

            expect(donorsArray[0]).to.equals(ownerAddress)

        })

        it("total donors should equal one donor", async () => { 
            expect(await accessStorage.totalDonors()).to.equal(1)
        })

        it("total donations should be equal to owner donation", async () => {
            
            expect(await accessStorage.totalDonations()).to.equal(ownerDonation)
        })

        it("balances mapping should reflects owner donation", async () => {
            expect(await accessStorage.donorAmout(ownerAddress)).to.equal(ownerDonation)
        })
        it("rejects donations greater than max donation and zero", async () => {            
            expect(accessStorage.donate({ value: EXCEED_MAX }))
            .to.be.revertedWithCustomError(accessStorage, "ExceedDonations")

            expect(accessStorage.donate({ value: ZERO_DONATION }))
            .to.be.revertedWithCustomError(accessStorage, "ZeroDonation")
        })
        it("rejects address zero", async () => {
            expect(accessStorage.connect(ADDRESS_ZERO).donate({ value: ethers.parseUnits("20", "gwei")}))
            .to.revertedWithCustomError(accessStorage, "AddressZero")
        })
        it("emits donation event", async () => {
            expect(accessStorage.donate()).to.emit(accessStorage, "DonationReceived")
            .withArgs(ownerAddress, ownerDonation)
        })
    })
  

    describe("second donation test", function () {
        before(async () => {
            secondDonation = ethers.parseEther("0.05")
        })
        it("process second donation ", async () => {
           
            const donateTx = await accessStorage.connect(donor).donate({ value: secondDonation})
            const receipt = await donateTx.wait();
        
            console.log(`Second Donation hash is: ${receipt.hash}`) 
        })
        it("total donors should equal two", async () => {
          
            console.log(`Array length is: ${donorsArray.length}`);

            expect(await accessStorage.totalDonors()).to.equal(2)
        })
        it("total donations should be equal to all donations", async () => {
            const allDonations = ethers.parseEther("0.1")
            expect(await accessStorage.totalDonations()).to.equal(allDonations)
        })
        it("balances mapping should reflects donor donation", async () => {
            expect(await accessStorage.donorAmout(donorAddress)).to.equal(secondDonation)
        })
        it("donors array should have 2 addresses", async () => {
            expect(donorsArray.length).to.equal(2);

            expect(donorsArray[0]).to.equal(ownerAddress)

            expect(donorsArray[1]).to.equal(donorAddress)
        })
        it("emits donation event", async () => {
            expect(accessStorage.donate()).to.emit(accessStorage, "DonationReceived")
            .withArgs(donorAddress, secondDonation)
        })
    })

    describe("third donation test", function () {
        before(async () => {
            thirdDonation = ethers.parseEther("0.05");
        })
        it("process third donation ", async () => {
           
            const donateTx = await accessStorage.connect(donor).donate({ value: thirdDonation})
            const receipt = await donateTx.wait();
          
            console.log(`Third Donation hash is: ${receipt.hash}`)  
        })
        it("total donors should not count the same donor twice", async () => {
            console.log(`Array length is: ${donorsArray.length}`) 

            expect(await accessStorage.totalDonors()).to.equal(2)
        })
        it("total donations should be equal to all donations", async () => {
            const allDonations = ethers.parseEther("0.15");
            expect(await accessStorage.totalDonations()).to.equal(allDonations)
        })
        it("balances mapping should reflects the sum of all donor donation", async () => {
            const donorDonations = ethers.parseEther("0.1")
            expect(await accessStorage.donorAmout(donorAddress)).to.equal(donorDonations)
        })
        it("donors array should not duplicate addresses", async () => {

            expect(donorsArray.length).to.equal(2);

            expect(donorsArray[0]).to.equal(ownerAddress)

            expect(donorsArray[1]).to.equal(donorAddress)
        })
    })
    describe("access mapping in slot zero", function () {
        it("get all donors balance", async () => {

            const paddedOwnerAddress = ethers.zeroPadValue(ownerAddress, 32)    // key padded
            console.log(`Owner Address in bytes 32: ${paddedOwnerAddress}`)

            const paddedDonorAddress = ethers.zeroPadValue(donorAddress, 32)    // key padded
            console.log(`Donor Address in bytes 32: ${paddedDonorAddress}`)
     
            const slotIndex = ethers.solidityPacked(["uint256"], [0])   //slot index
            console.log(`Slot Index 0: ${slotIndex}`)
        
            const concatOwnerKey = ethers.concat([paddedOwnerAddress, slotIndex])   // key + slot index
            console.log(`Concatenated Owner key & Slot: ${concatOwnerKey}`)

            const concatDonorKey = ethers.concat([paddedDonorAddress, slotIndex])   // key + slot index
            console.log(`Concatenated Donor key & Slot: ${concatDonorKey}`)

            const ownerHash = ethers.keccak256(concatOwnerKey)    // storage location of owner's key
            console.log(`Storage Slot of Owner Balance: ${ownerHash}`)

            const donorHash = ethers.keccak256(concatDonorKey)    // storage location of donor's key
            console.log(`Storage Slot of Donor Balance: ${donorHash}`)
      
            const ownerDonation = await provider.getStorage(contractAddress, ownerHash)
            console.log(`owner's donation is: ${ownerDonation}`) 

            const donorDonation = await provider.getStorage(contractAddress, donorHash)
            console.log(`donor's donation is: ${donorDonation}`) 

            // decode output
            const storedOwnerDonation = ethers.getUint(ownerDonation)
            console.log(`owner's donation is: ${storedOwnerDonation} Wei`)

            const storedDonorDonation = ethers.getUint(donorDonation)
            console.log(`donor's donation is: ${storedDonorDonation} Wei`)
            
            const ethOwner = ethers.formatUnits(storedOwnerDonation, "ether")
            console.log(`owner's donation in Ether is : ${ethOwner} ETH`)

            const ethDonor = ethers.formatUnits(storedDonorDonation, "ether")
            console.log(`owner's donation in Ether is : ${ethDonor} ETH`)

        })

    })
    describe("access total donations in slot one", function () {
        it("total donations should equal 0.15 eth", async () => {


            const bytesDonations = await provider.getStorage(contractAddress, 1)
            console.log(`total donations bytes is: ${bytesDonations}`)

            const storedDonations = ethers.getUint(bytesDonations)
            console.log(`donor's donation is: ${storedDonations} Wei`)

            const ethDonations = ethers.formatUnits(storedDonations, "ether")
            console.log(`total donations in Ether is : ${ethDonations} ETH`)
        })

    })
    // needs to further investigation
    describe("access donors array in slot two", function () {
        it("donors array contains owner and donor only", async () => {

            const array = await accessStorage.getAllDonors();
            console.log(`array length in contract is: ${array.length}`)

            // abi.encodePacked(slotIndex)
            const slotIndex = ethers.solidityPacked(["uint"], [2])
            console.log(`slot Index 2: ${slotIndex}`)

            const slotHash = ethers.keccak256(slotIndex)
            console.log(`owner slot hash is: ${slotHash}`)

            // const ownerIndex = ethers.solidityPacked(["uint"], [0])
            // console.log(`owner Index in array in bytes is: ${ownerIndex}`)

            const ownerIndex = donorsArray.indexOf(ownerAddress)
            console.log(`owner Index in array is: ${ownerIndex}`)

            const slotContent = await provider.getStorage(contractAddress, 2)
            console.log(`Contents of slot 2 of array declaration is: ${slotContent}`)

            // const ownerSlot = slotHash + ownerIndex
            // console.log(`owner slot is: ${ownerSlot}`)

            // const getDecimal = ethers.FixedNumber.fromBytes(slotHash)
            // console.log(`decimal is: ${getDecimal}`)

            // const decimal = BigInt(29102676481673041902632991033461445430619272659676223336789171408008386403023)

           
            // const ownerAddressInBytes = await provider.getStorage(contractAddress, slotHash)
            // console.log(`owner address in bytes is: ${ownerAddressInBytes}`)


            // const ownerSlotHash = ethers.keccak256(slotIndex)
            // console.log(`owner slot hash is: ${ownerSlotHash}`)

            // const ownerAddressInBytes = await provider.getStorage(contractAddress, ownerSlotHash)
            // console.log(`owner address in bytes is: ${ownerAddressInBytes}`)

        })

    })
    describe("access total donors in slot three", function () {
        it("total donors should equal two", async () => {

            const bytesDonors = await provider.getStorage(contractAddress, 3)
            console.log(`total donors in bytes is: ${bytesDonors}`)

            const numeric = ethers.toQuantity(bytesDonors)
            console.log(`total donors are: ${numeric}`)
        })
    })
    describe("access string in slot four", function () {
        it("cause is Wild Life", async () => {

            const causeBytes = await provider.getStorage(contractAddress, 4)
            console.log(`cause in bytes is: ${causeBytes}`)

            const causeSliced = ethers.dataSlice(causeBytes, 0, 31)
            console.log(`cause bytes without length: ${causeSliced}`)

            const cause = ethers.toUtf8String(causeSliced)
            console.log(`cause string: ${cause}`)
        })
    })

})




