// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockRouter {
    address public weth;

    constructor() {
        weth = address(this); // Just for mocking WETH address
    }

    function WETH() external view returns (address) {
        return weth;
    }

    function swapExactNativeForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts)
    {
        amounts = new uint[](2);
        amounts[0] = msg.value;
        amounts[1] = msg.value; // Simple 1:1 mock
        return amounts;
    }

    function swapExactTokensForNative(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts)
    {
        amounts = new uint[](2);
        amounts[0] = amountIn;
        amounts[1] = amountIn;
        return amounts;
    }
}
