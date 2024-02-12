// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract OrderBookDex {

    enum  ORDER_SIDE { BUY, SELL }
    enum  ORDER_TYPE { LIMIT, MARKET }

    struct Token { 
        bytes32 ticker; // Ticker of the token to be traded
        address tokenAddress; // Address of the token
        bool isTradable;
    }

    struct Balance { 
        uint free; // Free balance
        uint locked; // Locked balance for orders in the order book
    }

    struct Order { 
        uint id;
        address traderAddress;
        ORDER_SIDE orderSide;
        ORDER_TYPE orderType;
        uint amount;
        uint price; 
        uint date;
    }

    address public admin;
    bytes32[] public tickerList;
    bytes32 public quoteTicker;
    uint public nextOrderId;

    mapping (bytes32 => Token) public tokens;
    mapping (address => mapping (bytes32 => Balance)) public balances;
    mapping (bytes32 => mapping (uint => Order[])) public orderBook;

    constructor() { 
        admin = msg.sender; 
        quoteTicker = bytes32(0);
    }

    function setQuoteTicker(bytes32 _ticker) 
        external onlyAdmin() tokenExist(_ticker) quoteTickerUndefined() {
        quoteTicker = _ticker;
    }

    function addToken(bytes32 _ticker, address _tokenAddress) 
        external onlyAdmin() tokenDoesNotExist(_ticker) {
        tokens[_ticker] = Token(_ticker, _tokenAddress, true); 
        tickerList.push(_ticker);
    }

    function getTokens() 
        external view returns(Token[] memory) {
        Token[] memory _tokens = new Token[](tickerList.length);

        for (uint i = 0; i < tickerList.length; i++) {
            bytes32 currentTicker = tickerList[i];
            address tokenAddress = tokens[currentTicker].tokenAddress;
            bool isTradable = tokens[currentTicker].isTradable;
            _tokens[i] = Token(currentTicker, tokenAddress, isTradable);
        }

        return _tokens;
    }

    function getTickerList() 
        external view returns(bytes32[] memory) {
        return tickerList;
    }

    function disableTokenTrading(bytes32 _ticker) 
        external onlyAdmin() tokenExist(_ticker) tokenEnabled(_ticker) isNotQuoteTicker(_ticker) {
        tokens[_ticker].isTradable = false;
    }

    function enableTokenTrading(bytes32 _ticker) 
        external onlyAdmin() tokenExist(_ticker) tokenDisabled(_ticker) {
        tokens[_ticker].isTradable = true;
    }

    function deposit(bytes32 _ticker, uint _amount) 
        external tokenExist(_ticker) {
        IERC20 token = IERC20(tokens[_ticker].tokenAddress);
        token.transferFrom(msg.sender, address(this), _amount);
        balances[msg.sender][_ticker].free = balances[msg.sender][_ticker].free + _amount;
    }

    function withdraw(bytes32 _ticker, uint _amount)
        external tokenExist(_ticker) hasEnoughBalance(_ticker, _amount) {

        IERC20 token = IERC20(tokens[_ticker].tokenAddress);
        balances[msg.sender][_ticker].free = balances[msg.sender][_ticker].free - _amount;
        token.transfer(msg.sender, _amount);
    }

    function placeOrder(bytes32 _ticker, uint _amount, uint _price, ORDER_SIDE _side, ORDER_TYPE _type) 
        external tokenExist(_ticker) quoteTickerDefined() isNotQuoteTicker(_ticker) {
        orderBook[_ticker][uint(_side)].push(
            Order(nextOrderId, msg.sender, _side, _type, amount, _price, block.timwstamp)
        );

        sortOrders();
    }

    function sortOrders(bytes32 _ticker, ORDER_SIDE _side) 
        internal {    
        Order[] storage orders = orderBook[_ticker][uint(_side)];
        uint index = (orders.length > 0) ? (orders.length - 1) : 0;
        
        if (_side == ORDER_SIDE.SELL) {
            // SELL orders will be matched against Buy orders 
            // For the market buyers, the best price is the lowest price
            // SORT SELL ORDERS BY ASCENDING PRICES [4, 5, 6]
            while(index > 0) {
                if (orders[index - 1].price > orders[index].price) {
                    Order memory order = orders[index - 1];
                    orders[index - 1] = orders[index];
                    orders[index] = order;
                }
                index = index.sub(1);       
            }
        } else {
            // BUY orders will be matched against Sell orders 
            // For the market Sellers, the best price is the highest price
            // SORT BUY ORDERS BY DESCENDING PRICES [3, 2, 1]
            while(index > 0) {
                if (orders[index - 1].price < orders[index].price) {
                    Order memory order = orders[index - 1];
                    orders[index - 1] = orders[index];
                    orders[index] = order;
                }
                index = index.sub(1);       
            }
        }
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
}