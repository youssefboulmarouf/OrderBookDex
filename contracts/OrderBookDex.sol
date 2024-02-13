// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract OrderBookDex {

    enum ORDER_SIDE { BUY, SELL }
    enum ORDER_TYPE { MARKET, LIMIT }

    struct Token { 
        bytes32 ticker;
        address tokenAddress;
        bool isTradable;
    }

    struct Balance { 
        uint free; 
        uint locked;
    }

    struct Order { 
        uint id;
        address traderAddress;
        ORDER_SIDE orderSide;
        ORDER_TYPE orderType;
        bytes32 ticker; 
        uint amount; 
        uint[] fills; 
        uint price; 
        uint date;
    }

    struct OrpderParams {
        bytes32 ticker;
        uint amount;
        uint price;
        ORDER_SIDE orderSide;
        ORDER_TYPE orderType;
    }

    address public admin;
    bytes32[] public tickerList;
    bytes32 public quoteTicker;

    mapping (bytes32 => Token) public tokens;
    mapping (address => mapping (bytes32 => Balance)) public balances;
    mapping (bytes32 => mapping (ORDER_SIDE => Order[])) public orderBook;

    constructor() { 
        admin = msg.sender; 
        quoteTicker = bytes32(0);
    }

    function setQuoteTicker(bytes32 _ticker) 
        external 
        onlyAdmin() 
        tokenExist(_ticker) 
        quoteTickerUndefined() {
            quoteTicker = _ticker;
        }

    function addToken(bytes32 _ticker, address _tokenAddress) 
        external 
        onlyAdmin() 
        tokenDoesNotExist(_ticker) {
            tokens[_ticker] = Token(_ticker, _tokenAddress, true); 
            tickerList.push(_ticker);
        }

    function getTokens() 
        external 
        view 
        returns(Token[] memory) {
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

    function disableTokenTrading(bytes32 _ticker) 
        external 
        onlyAdmin() 
        tokenExist(_ticker) 
        tokenEnabled(_ticker) 
        isNotQuoteTicker(_ticker) {
            tokens[_ticker].isTradable = false;
        }

    function enableTokenTrading(bytes32 _ticker) 
        external 
        onlyAdmin() 
        tokenExist(_ticker) 
        tokenDisabled(_ticker) {
            tokens[_ticker].isTradable = true;
        }

    function deposit(bytes32 _ticker, uint _amount) 
        external 
        tokenExist(_ticker) {
            IERC20 token = IERC20(tokens[_ticker].tokenAddress);
            token.transferFrom(msg.sender, address(this), _amount);
            balances[msg.sender][_ticker].free = balances[msg.sender][_ticker].free + _amount;
        }

    function withdraw(bytes32 _ticker, uint _amount) 
        external 
        tokenExist(_ticker) 
        hasEnoughBalance(_ticker, _amount) {
            IERC20 token = IERC20(tokens[_ticker].tokenAddress);
            balances[msg.sender][_ticker].free = balances[msg.sender][_ticker].free - _amount;
            token.transfer(msg.sender, _amount);
        }

    function placeOrder(OrpderParams memory _params) 
        external {

        }
    
    modifier onlyAdmin() {
        require(admin == msg.sender, "Unauthorized!");
        _;
    }

    modifier tokenDoesNotExist(bytes32 _ticker) {
        require(tokens[_ticker].tokenAddress == address(0), "Ticker Exists!");
        _;
    }

    modifier tokenExist(bytes32 _ticker) {
        require(tokens[_ticker].tokenAddress != address(0), "Ticker Does Not Exist!");
        _;
    }

    modifier tokenDisabled(bytes32 _ticker) {
        require(tokens[_ticker].isTradable == false, "Token Enabled!");
        _;
    }

    modifier tokenEnabled(bytes32 _ticker) {
        require(tokens[_ticker].isTradable == true, "Token Disabled!");
        _;
    }

    modifier quoteTickerDefined() {
        require(quoteTicker != bytes32(0), "Quote Ticker Undefined!");
        _;
    }

    modifier quoteTickerUndefined() {
        require(quoteTicker == bytes32(0), "Quote Ticker Defined!");
        _;
    }

    modifier isQuoteTicker(bytes32 _ticker) {
        require(quoteTicker == _ticker, "Not Quote Ticker!");
        _;
    }

    modifier isNotQuoteTicker(bytes32 _ticker) {
        require(quoteTicker != _ticker, "Quote Ticker!");
        _;
    }

    modifier hasEnoughBalance(bytes32 _ticker, uint _amount) {
        require(balances[msg.sender][_ticker].free >= _amount, "Low Balance!");
        _;
    }

    modifier placeOrderModifier(OrpderParams memory _params) {
        // Tokne Exists
        require(tokens[_params.ticker].tokenAddress != address(0), "Ticker Does Not Exist!");

        // Token Enabled
        require(tokens[_params.ticker].isTradable == true, "Token Disabled!");

        // Quote Ticker Defined
        require(quoteTicker != bytes32(0), "Quote Ticker Undefined!");

        // Is Not Quote Ticker
        require(quoteTicker != _params.ticker, "Quote Ticker!");
        _;
    }
}
