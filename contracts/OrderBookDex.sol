// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OrderBookDex {

    // --- Variables ---
    address public admin; // Contract owner

    // --- Contract Constructor ---
    constructor() { admin = msg.sender; }
}