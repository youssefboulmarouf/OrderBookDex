// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract OrderBookDex {

    struct Token { 
        bytes32 ticker; // Ticker of the token to be traded
        address tokenAddress; // Address of the token
        bool isTradable;
    }

    // --- Structs ---
    struct Balance { 
        uint free; // Free balance
        uint locked; // Locked balance for orders in the order book
    }

    // --- Variables ---
    address public admin; // Contract owner
    bytes32[] public tickerList; // List of token's ticker

    mapping (bytes32 => Token) public tokens;
    mapping (address => mapping (bytes32 => Balance))   public balances;

    // --- Contract Constructor ---
    constructor() { admin = msg.sender; }

    function addToken(bytes32 _ticker, address _tokenAddress) external onlyAdmin() tokenDoesNotExist(_ticker) {
        tokens[_ticker] = Token(_ticker, _tokenAddress, true); 
        tickerList.push(_ticker);
    }

    // --- Get Tokens ---
    function getTokens() external view returns(Token[] memory) {
        // Since we can't return a mapping in Solidity
        // We have to convert the Tokens mapping to Token List

        // Creating a memory list of Tokens
        Token[] memory _tokens = new Token[](tickerList.length);

        // Populating the list a memory list of Tokens
        for (uint i = 0; i < tickerList.length; i++) {
            bytes32 currentTicker = tickerList[i];
            address tokenAddress = tokens[currentTicker].tokenAddress;
            bool isTradable = tokens[currentTicker].isTradable;
            _tokens[i] = Token(currentTicker, tokenAddress, isTradable);
        }

        return _tokens;
    }

    // --- Get Ticker List ---
    function getTickerList() external view returns(bytes32[] memory) {
        return tickerList;
    }

    // --- disable Trading For A Given Token ---
    function disableTokenTrading(bytes32 _ticker) external onlyAdmin() tokenExist(_ticker) tokenEnabled(_ticker) {
        tokens[_ticker].isTradable = false;
    }

    // --- Enable Trading For A Given Token ---
    function enableTokenTrading(bytes32 _ticker) external onlyAdmin() tokenExist(_ticker) tokenDisabled(_ticker) {
        tokens[_ticker].isTradable = true;
    }

    // --- Deposit Tokens ---
    function deposit(bytes32 _ticker, uint _amount) external tokenExist(_ticker) {
        IERC20 token = IERC20(tokens[_ticker].tokenAddress);
        token.transferFrom(msg.sender, address(this), _amount);
        balances[msg.sender][_ticker].free = balances[msg.sender][_ticker].free + _amount;
    }

        
    // --- Withdraw Tokens ---
    function withdraw(bytes32 _ticker, uint _amount) external tokenExist(_ticker) hasEnoughBalance(_ticker, _amount) {

        IERC20 token = IERC20(tokens[_ticker].tokenAddress);
        balances[msg.sender][_ticker].free = balances[msg.sender][_ticker].free - _amount;
        token.transfer(msg.sender, _amount);
    }

    // --- Modifier: Admin Access Controle ---
    modifier onlyAdmin() {
        require(admin == msg.sender, "Unauthorized!");
        _;
    }

    // --- Modifier: Token Should NOT Exist ---
    modifier tokenDoesNotExist(bytes32 _ticker) {
        require(tokens[_ticker].tokenAddress == address(0), "Ticker Exists!");
        _;
    }

    // --- Modifier: Token Should Exist ---
    modifier tokenExist(bytes32 _ticker) {
        require(tokens[_ticker].tokenAddress != address(0), "Ticker Does Not Exist!");
        _;
    }

    // --- Modifier: Token Should Be Disabled ---
    modifier tokenDisabled(bytes32 _ticker) {
        require(tokens[_ticker].isTradable == false, "Token Enabled!");
        _;
    }

    // --- Modifier: Token Should Be Enabled ---
    modifier tokenEnabled(bytes32 _ticker) {
        require(tokens[_ticker].isTradable == true, "Token Disabled!");
        _;
    }

    // --- Modifier: Trader Should Have Enough Balance For Action ---
    modifier hasEnoughBalance(bytes32 _ticker, uint _amount) {
        require(balances[msg.sender][_ticker].free >= _amount, "Low Balance!");
        _;
    }
}