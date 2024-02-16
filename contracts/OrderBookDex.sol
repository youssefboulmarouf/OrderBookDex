// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '../node_modules/hardhat/console.sol';

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
    uint public nextOrderId;

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

    function getOrders(bytes32 _ticker, ORDER_SIDE _side)
        external 
        view 
        returns(Order[] memory) {
            return orderBook[_ticker][_side];
        }

    function placeOrder(OrpderParams memory _params) 
        external 
        placeOrderModifier(_params)
        hasEnoughTokenToSell(_params) {
            if (_params.orderType == ORDER_TYPE.LIMIT) {
                createLimitOrder(_params.ticker, _params.amount, _params.price, _params.orderSide);
            } else if (_params.orderType == ORDER_TYPE.MARKET) {
                createMarketOrder(_params.ticker, _params.amount, _params.orderSide);
            } else {
                revert('Unkown Order Type!');
            }
        }
    
    function createLimitOrder(bytes32 _ticker, uint _amount, uint _price, ORDER_SIDE _side) 
        internal
        hasEnoughTokenToBuy(_amount, _price, _side) {
            lockOrderAmount(_ticker, _amount, _price, _side, ORDER_TYPE.LIMIT);
            Order storage newOrder = createOrder(_ticker, _amount, _price, _side, ORDER_TYPE.LIMIT);
            sortOrders(_ticker, _side);
            matchOrders(newOrder);
        }
    
    function createMarketOrder(bytes32 _ticker, uint _amount, ORDER_SIDE _side)  
        internal
        ordersExists(_ticker, _side) {
            
        }

    function lockOrderAmount(bytes32 _ticker, uint _amount, uint _price, ORDER_SIDE _side, ORDER_TYPE _orderType) 
        internal {
            bytes32 tokenToLock = _ticker;
            uint amountToLock = _amount;

            if (_side == ORDER_SIDE.BUY) {
                tokenToLock = quoteTicker;
                if (_orderType == ORDER_TYPE.LIMIT) { 
                    amountToLock = _amount * _price;
                }
            }

            balances[msg.sender][tokenToLock].free = balances[msg.sender][tokenToLock].free - amountToLock;
            balances[msg.sender][tokenToLock].locked = balances[msg.sender][tokenToLock].locked + amountToLock;
        }

    function createOrder(bytes32 _ticker, uint _amount, uint _price, ORDER_SIDE _side, ORDER_TYPE _orderType) 
        internal 
        returns (Order storage) {
            uint[] memory fills;

            nextOrderId = nextOrderId + 1;

            Order memory newOrder = Order(nextOrderId, msg.sender, _side, _orderType, _ticker, _amount, fills, _price, block.timestamp);
            orderBook[_ticker][_side].push(newOrder);
            
            return orderBook[_ticker][_side][(orderBook[_ticker][_side].length - 1)];
        }
    
    function sortOrders(bytes32 _ticker, ORDER_SIDE _side) 
        internal {
        
            Order[] storage orders = orderBook[_ticker][_side];
            uint index = (orders.length > 0) ? (orders.length - 1) : 0;
            
            while(index > 0) {
                if (orders[index - 1].price > orders[index].price) {
                    Order memory order = orders[index - 1];
                    orders[index - 1] = orders[index];
                    orders[index] = order;
                } else if (orders[index - 1].price == orders[index].price && orders[index - 1].date > orders[index].date) {
                    Order memory order = orders[index - 1];
                    orders[index - 1] = orders[index];
                    orders[index] = order;
                }
                index = index - 1;
            }
        }

    function matchOrders(Order storage newOrder) 
        internal {

        }
    
    function amountFilled(Order memory order) 
        internal 
        pure
        returns(uint) {
            uint filledAmount;
            
            for (uint i; i < order.fills.length; i = i + 1) {
                filledAmount = filledAmount + order.fills[i];
            }

            return filledAmount;
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

    modifier hasEnoughTokenToSell(OrpderParams memory _params) {
        if (_params.orderSide == ORDER_SIDE.SELL) {
            require(balances[msg.sender][_params.ticker].free >= _params.amount, "Low Token Balance!");
        }
        _;
    }

    modifier hasEnoughTokenToBuy(uint _amount, uint _price, ORDER_SIDE _side) {
        // This should ONLY be checked on LIMIT orders 
        // since we know the exact amount and price
        // which is not the case in MARKET orders
        if (_side == ORDER_SIDE.BUY) {
            require(balances[msg.sender][quoteTicker].free >= _amount * _price, "Low Quote Balance!");
        }
        _;
    }

    modifier ordersExists(bytes32 _ticker, ORDER_SIDE _side) {
        // This should ONLY be checked on MARKET orders 
        // since we need opposite orders to exist for the matching to happen
        Order[] memory orders = orderBook[_ticker][(_side == ORDER_SIDE.BUY ? ORDER_SIDE.SELL : ORDER_SIDE.BUY)];
        require(orders.length > 0, "Empty Order Book!");
        _;
    }
}
