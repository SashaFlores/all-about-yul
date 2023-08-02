// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

contract Arithmetic {


    // `bytes4(keccak256('Overflow()')`
    bytes32 constant overflowSelector = 0x35278d1200000000000000000000000000000000000000000000000000000000;

    // `bytes4(keccak256('Underflow()')`
    bytes32 constant underflowSelector = 0xcaccb6d900000000000000000000000000000000000000000000000000000000;

    // `bytes4(keccak256('ZeroDivisor()')`
    bytes32 constant zeroDivisorSelector = 0x20e3a9a600000000000000000000000000000000000000000000000000000000;

    // `bytes4(keccak256('ZeroMultiplier()')`
    bytes32 constant zeromMultiplerSelector = 0xcdcf71c000000000000000000000000000000000000000000000000000000000;



    error Overflow();
    error Underflow();
    error zeroDivisor();
    error zeroMultiplier();

    // Gas: 993
    function addSolidity(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
    }


     // Gas: 761 
    function addAssembly(uint256 a, uint256 b) public pure returns (uint256) {
        uint256 result;

        assembly {
            result := add(a, b)
        }

        return result;
    }

    // Gas: 853
    function addWithCheck(uint256 a, uint256 b) public pure returns (uint256) {
        uint256 result;

        assembly {
            result := add(a, b)
            if lt(result, a) {
                mstore(0x00, overflowSelector)
                revert(0x00, 0x20)
            }
        }

        return result;
    }

    // Gas: 1015
    function subSolidity(uint256 a, uint256 b) public pure returns (uint256) {
        return a - b;
    }

    // Gas: 783 
    function substractAssembly(uint256 a, uint256 b) public pure returns (uint256) {
        uint256 result;

        assembly {
            result := sub(a, b)
        }

        return result;
    }

    // Gas: 895
    function subtractWithCheck(uint256 a, uint256 b) public pure returns (uint256) {
        uint256 result;

        assembly {
            result := sub(a, b)
            if gt(result, a) {
                mstore(0x00, underflowSelector)
                revert(0x00, 0x20)
            }
        }

        return result;
    }


    function divideSolidity(uint256 a, uint256 b) public pure returns(uint256) {
        return a / b;
    }

    function divideAssembly(uint256 a, uint256 b) public pure returns(uint256) {
        uint256 result;
        assembly {
            result := div(a, b)
        }
        return result;
    }


    function divideWithCheck(uint256 a, uint256 b) public pure returns(uint256) {
        uint256 result;
        assembly {
            result := div(a, b)
            if iszero(b) {
                mstore(0x00, zeroDivisorSelector)
                revert(0x00, 0x20)
            }
        }
        return result;
    }


    function multiplySolidity(uint256 a, uint256 b) public pure returns(uint256) {
        return a * b;
    }

    function multiplyAssembly(uint256 a, uint256 b) public pure returns(uint256) {
        uint256 result;
        assembly {
            result := mul(a, b)
        }
        return result;
    }

    function multiplyWithCheck(uint256 a, uint256 b) public pure returns(uint256) {
        uint256 result;
        assembly {
            result := mul(a, b)
            if or(iszero(a), iszero(b)) {
                mstore(0x00, zeromMultiplerSelector)
                revert(0x00, 0x20)
            }
        }
        return result;
    }

}