// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

contract AccessStorage {

    uint256 private constant MAX_DONATION = 5 ether;       
    mapping(address => uint256) private _balances;              // slot 0
    address private immutable _owner;
    uint256 private _totalDonations;                            // slot 1
    address[] private _donors;                                  // slot 2
    uint256 private _totalDonors;                               // slot 3
    string private _cause;                                      // store 4



    //bytes4(keccak256('ExceedDonations()'))
    bytes32 private constant ExceedDonationsSelector = 0x1a02c29500000000000000000000000000000000000000000000000000000000;

    //bytes4(keccak256('AddressZero()'))
    bytes32 private constant AddressZeroSelector = 0x9fabe1c100000000000000000000000000000000000000000000000000000000;

    //bytes4(keccak256('ZeroDonation()'))
    bytes32 private constant ZeroDonationSelector = 0x9fabe1c100000000000000000000000000000000000000000000000000000000;


    //keccak256('DonationReceived(address,uint256)')
    bytes32 private constant donationHash = 0x264f630d9efa0d07053a31163641d9fcc0adafc9d9e76f1c37c2ce3a558d2c52;

    event DonationReceived(address indexed donor, uint256 donation);


    error ExceedDonations();
    error AddressZero();
    error ZeroDonation();


    constructor(string memory purpose)  {
    
        assembly {
            // Load the bytes32 representation of the string data
            let nameData := mload(add(purpose, 0x20)) 
            
            // Calculate the length of the string
            let length := mload(purpose)
            
            // Calculate the value to store (length * 2) as rightmost bytes
            let valueToStore := shl(1, length)
            
            // Store the value in storage slot 4
            sstore(0x04, or(nameData, valueToStore))
        }
        _owner = msg.sender;
    }


    function getCause() public view returns(string memory) {
        assembly {
            // free memory pointer
            let ptr := mload(0x40)
            // store the string pointer
            mstore(ptr, 0x20)
            // load data in slot 4
            let storedCause := sload(0x04)
            // extracts the most right 2 bytes as length of string
            let length := and(storedCause, 0xFFFF)

            mstore(add(ptr, 0x20), length)

            mstore(add(ptr, 0x40), sub(storedCause, length))

            return(ptr, 0x60)
        }

    }


    function donorAmout(address account) public view returns(uint256) {
        assembly {
            mstore(0x00, account)
            mstore(0x20, 0x00)
            let hash := keccak256(0x00, 0x40)
            let donorBalance := sload(hash)
            mstore(0x00, donorBalance)
            return(0x00, 0x20)
        }
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
            //--- Mapping Slot 0 ---
            // memory pointer
            let ptr := mload(0x40)
            // store caller 
            mstore(ptr, caller())
            // store the balance slot
            mstore(add(ptr, 0x20), 0x00)
            // get the hash of key mapping where
            // the balance is stored
            let callerBalanceSlot := keccak256(ptr, 0x40)
            // get the caller's balance if any
            let callerBalance := sload(callerBalanceSlot)
            // store new balance at storage slot
            sstore(callerBalanceSlot, add(callerBalance, callvalue()))

            // --`_totalDonations` Slot 1----
            sstore(0x01, add(sload(0x01), callvalue()))

            //--`_donors` Slot 2 and `_totalDonors` in slot 3-----
            // load `_donors` array from slot 2
            let donorsArray := sload(0x02)
            // load `_totalDonors` from slot 3
            let arrayLength := sload(0x03)
            // check if caller already exist by looping `_donors` array
            let found := 0
            for { let i := 0} lt(i, arrayLength) { i := add(i, 1)} {
                if  eq(sload(add(donorsArray, mul(0x20, i))), caller()) {
                    found := 1
                    i := arrayLength
                }
            }
            if eq(found, 0) {
                // caller isnot in array so add him
                sstore(add(donorsArray, mul(0x20, arrayLength)), caller())
                // increment `_totalDonors` in slot 3
                sstore(0x03, add(arrayLength, 1))

            }
            // m store non indexed amount
            // log event 
            mstore(0x00, callvalue())
            log2(0x00, 0x20, donationHash, caller())
        }
    }

     function getAllDonors() public view returns (address[] memory) {
        address[] memory allDonors;
        uint256 arrayLength;

        assembly {
            // Load the length of the _donors array from slot 2 
            arrayLength := sload(0x03)

            // Allocate memory for the new array (allDonors) using the length of _donors
            // Load "free memory pointer"
            let ptr := mload(0x40)
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


    function owner() public view returns(address) {
        return _owner;
    }


}
