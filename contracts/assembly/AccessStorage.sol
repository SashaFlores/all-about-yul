// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

contract AccessStorage {

    uint256 private constant MAX_DONATION = 5 ether;       
    mapping(address => uint256) private _balances;          
    address private immutable _owner;
    uint256 private _totalDonations;                       
    address[] private _donors;                            
    uint256 private _donorsNo;                            

    //bytes4(keccak256('ExceedDonations()'))
    bytes32 private constant ExceedDonationsSelector = 0x1a02c29500000000000000000000000000000000000000000000000000000000;

    //bytes4(keccak256('AddressZero()'))
    bytes32 private constant AddressZeroSelector = 0x9fabe1c100000000000000000000000000000000000000000000000000000000;

    //bytes4(keccak256('ZeroDonation()'))
    bytes32 private constant ZeroDonationSelector = 0x9fabe1c100000000000000000000000000000000000000000000000000000000;



    error ExceedDonations();
    error AddressZero();
    error ZeroDonation();


    constructor() payable {
        assembly {
            /**
             * sanity check if value send exceeds max donations
             * store initial donation in `_totalDonations` in slot 1
             */
            if gt(callvalue(), MAX_DONATION) {
                sstore(0x00, ExceedDonationsSelector)
                revert(0x00, 0x04)
            }
            
            if iszero(caller()) {
                sstore(0x00, AddressZeroSelector) 
                revert(0x00, 0x04)
            }

            if gt(callvalue(), 0) {
                // Mapping in slot 0
                // store mapping key at slot 0
                mstore(0x00, caller())
                // store slot of mapping declaration
                mstore(0x20, 0x00)
                // hash the first 64 bytes of memory to generate the balance slot
                let slot := keccak256(0x00, 0x40)
                // store the call value as caller's balance
                mstore(slot, callvalue())

                // store in slot 1 the initial donation
                sstore(0x01, callvalue())

                // add to array of `_donors` addresses : slot 2
                let arraySlot := keccak256(0x02, 0x20)
                sstore(arraySlot, caller())

                // initialize `_donorsNo` to 1
                sstore(0x03, 1)
            }
            
        }

        _owner = msg.sender;
    }

    function donate() public payable {
        assembly {
            // first sanity check if address zero
            if iszero(caller()) {
                sstore(0x00, AddressZeroSelector) 
                revert(0x00, 0x04)
            }
            // second sanity check if exceeds max donation
            if gt(callvalue(), MAX_DONATION) {
                sstore(0x00, ExceedDonationsSelector)
                revert(0x00, 0x04)
            }
            // make sure actual donation is made
            if iszero(callvalue()) {
                sstore(0x00, ZeroDonationSelector)
                revert(0x00, 0x04)
            }
            // Load the current donation amount for the caller from the _balances mapping
            // and add the new donation amount to it
            let slot := keccak256(0x00, 0x40) 
            let previousDonation := sload(slot)
            sstore(slot, add(previousDonation, callvalue()))

            // Check if the caller already exists in the _donors array
            // If not, add the caller to the _donors array and increment _donorsNo
            // Note: To check if the address exists in the array, 
            // we loop through the array and compare each element.
            // If found, we set the `found` flag to 1, otherwise, it remains 0.
            let donorsArray := sload(0x02) // Load from slot 2 (_donors array)
            let arrayLength := sload(0x03) // Load from slot 3 (_donorsNo)
            let found := 0
            for { let i := 0 } lt(i, arrayLength) { i := add(i, 1) } {
                if eq(sload(add(donorsArray, mul(0x20, i))), caller()) {
                    found := 1
                    i := arrayLength // Exit the loop early
                }
            }

            if eq(found, 0) {
                // The caller does not exist in the _donors array, add them
                sstore(add(donorsArray, mul(0x20, arrayLength)), caller())
                // Increment _donorsNo
                sstore(0x03, add(arrayLength, 1)) 
            }

            // Update the total donation amount
            sstore(0x01, add(sload(0x01), callvalue()))
        }
    }

    function totalDonations() public view returns(uint256) {
        assembly {
            mstore(0x00, sload(0x01))
            return(0x00, 0x20)
        }
    }

    function totalDonors() public view returns(uint256) {
        assembly {
            mstore(0x00, sload(0x03))
            return(0x00, 0x20)
        }
    }

    function getAllDonors() public view returns (address[] memory) {
        address[] memory allDonors;
        uint256 arrayLength;

        assembly {
            // Load the length of the _donors array from slot 3 (_donorsNo)
            arrayLength := sload(0x03)

            // Allocate memory for the new array (allDonors) using the length of _donors
            // Load "free memory pointer"
            allDonors := mload(0x40) 
            // Set length of the new array
            mstore(allDonors, arrayLength) 

            // Loop through the _donors array and copy each element to the new array in memory
            for { let i := 0 } lt(i, arrayLength) { i := add(i, 1) } {
                // Load donor address from _donors array
                let donorAddress := sload(add(sload(0x02), mul(0x20, i))) 
                // Store donor address in new array
                mstore(add(allDonors, mul(0x20, add(i, 1))), donorAddress) 
            }

            // Update "free memory pointer" to point to the end of the new array
            mstore(0x40, add(allDonors, mul(0x20, add(arrayLength, 1))))
        }

        return allDonors;
    }


}