// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OrderBookDex {

    struct Token { 
        bytes32 ticker; // Ticker of the token to be traded
        address tokenAddress; // Address of the token
    }

    // --- Variables ---
    address public admin; // Contract owner
    bytes32[] public tickerList; // List of token's ticker

    mapping (bytes32 => Token) public tokens;

    // --- Contract Constructor ---
    constructor() { admin = msg.sender; }

    function addToken(bytes32 _ticker, address _tokenAddress) external onlyAdmin() tokenDoesNotExist(_ticker) {
        tokens[_ticker] = Token(_ticker, _tokenAddress); 
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
            _tokens[i] = Token(currentTicker, tokenAddress);
        }

        return _tokens;
    }

    // --- Get Ticker List ---
    function getTickerList() 
        external view returns(bytes32[] memory) {
        
        return tickerList;
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
}