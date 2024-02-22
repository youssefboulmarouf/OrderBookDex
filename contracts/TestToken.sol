// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract TestToken is ERC20{
    
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

    function faucet(address account, uint amount) external {
        _mint(account, amount);
    }
}