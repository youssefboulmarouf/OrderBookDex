// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import 'hardhat/console.sol';

contract OrderBookDex {

    enum ORDER_SIDE { BUY, SELL }
    enum ORDER_TYPE { MARKET, LIMIT }

    struct Token { 
        bytes32 ticker;
        address tokenAddress;
        bool isTradable;
    }

    struct Balance { 
        uint256 free; 
        uint256 locked;
    }

    struct Order { 
        uint256 id;
        address traderAddress;
        ORDER_SIDE orderSide;
        ORDER_TYPE orderType;
        bytes32 ticker; 
        uint256 amount; 
        uint256[] fills; 
        uint256 price; 
        uint256 date;
    }

    struct OrderParams {
        bytes32 ticker;
        uint256 amount;
        uint256 price;
        ORDER_SIDE orderSide;
        ORDER_TYPE orderType;
    }

    event NewTrade( 
        uint256 tradeId, 
        uint256 makerOrderId, 
        uint256 takerOrderId, 
        bytes32 indexed ticker, 
        address indexed makerTrader, 
        address indexed takerTrader, 
        ORDER_TYPE takerOderType,
        ORDER_SIDE takerTradeSide,
        uint256 amount, 
        uint256 price,
        uint256 date
    );

    address public admin;
    bytes32[] public tickerList;
    bytes32 public quoteTicker;
    uint256 public nextOrderId;
    uint256 public nextTradeId;

    mapping (bytes32 => Token) public tokens;
    mapping (address => mapping (bytes32 => Balance)) public balances;
    mapping (bytes32 => mapping (ORDER_SIDE => Order[])) public orderBook;

    constructor() { 
        admin = msg.sender; 
        quoteTicker = bytes32(0);
    }

    function isAdmin()
        external
        view
        returns (bool) {
            return admin == msg.sender;
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
            for (uint256 i = 0; i < tickerList.length; i++) {
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

    function deposit(bytes32 _ticker, uint256 _amount) 
        external 
        payable
        tokenExist(_ticker) {
            IERC20 token = IERC20(tokens[_ticker].tokenAddress);
            token.transferFrom(msg.sender, address(this), _amount);
            balances[msg.sender][_ticker].free = balances[msg.sender][_ticker].free + _amount;
        }

    function withdraw(bytes32 _ticker, uint256 _amount) 
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

    function placeOrder(OrderParams memory _params) 
        external 
        placeOrderModifier(_params)
        ordersExists(_params.ticker, _params.orderSide, _params.orderType) {
            uint256 price = 0;

            if (_params.orderType == ORDER_TYPE.LIMIT) {
                price = _params.price;
            } else {
                price = deduceMarketPrice(_params.ticker, _params.orderSide);
            }

            lockOrderAmount(_params.ticker, _params.amount, price, _params.orderSide, _params.orderType);
            
            Order memory newOrder = createOrder(_params.ticker, _params.amount, price, _params.orderSide, _params.orderType);
            
            sortOrders(_params.ticker, _params.orderSide);
            
            uint256 orderIndex = findOrderById(_params.ticker, _params.orderSide, newOrder.id);
            Order[] storage orders = orderBook[_params.ticker][_params.orderSide];
            
            matchOrders(orders[orderIndex]);
            cleanOrders(_params.ticker);
        }

    function lockOrderAmount(bytes32 _ticker, uint256 _amount, uint256 _price, ORDER_SIDE _side, ORDER_TYPE _type) 
        internal {
            bytes32 tokenToLock = _ticker;
            uint256 amountToLock = deduceAmountToLock(_ticker, _amount, _price, _side, _type);

            if (_side == ORDER_SIDE.BUY) {
                tokenToLock = quoteTicker;
                require(balances[msg.sender][tokenToLock].free >= amountToLock, "Low Quote Balance!");
            } else {    
                require(balances[msg.sender][tokenToLock].free >= amountToLock, "Low Token Balance!");
            }
            
            balances[msg.sender][tokenToLock].free = balances[msg.sender][tokenToLock].free - amountToLock;
            balances[msg.sender][tokenToLock].locked = balances[msg.sender][tokenToLock].locked + amountToLock;
        }

    
    function deduceAmountToLock(bytes32 _ticker, uint256 _amount, uint256 _price, ORDER_SIDE _side, ORDER_TYPE _type) 
        internal 
        view 
        returns(uint256) {
            Order[] memory oppositeOrders = orderBook[_ticker][_side == ORDER_SIDE.BUY ? ORDER_SIDE.SELL : ORDER_SIDE.BUY];

            if (oppositeOrders.length == 0 && _type == ORDER_TYPE.LIMIT) {
                return (_side == ORDER_SIDE.BUY) 
                    ? (_amount * _price) / 1e18 
                    : _amount;
            }

            uint256 remaining = _amount;
            uint256 amountToLock = 0;
            uint256 index = 0;

            while (index < oppositeOrders.length && remaining > 0) {
                if (
                    (_side == ORDER_SIDE.BUY && oppositeOrders[index].price <= _price) 
                    || (_side == ORDER_SIDE.SELL && oppositeOrders[index].price >= _price) 
                    || _type == ORDER_TYPE.MARKET
                ) {
                    uint256 orderAmountFilled = amountFilled(oppositeOrders[index]);
                    uint256 availableOrderAmount = oppositeOrders[index].amount - orderAmountFilled;
                    uint256 matched = (remaining > availableOrderAmount) ? availableOrderAmount : remaining;

                    amountToLock = (_side == ORDER_SIDE.BUY) 
                        ? amountToLock + (oppositeOrders[index].price * matched) / 1e18
                        : amountToLock + matched;

                    remaining = remaining - matched;
                }
                index = index + 1;
            }

            if (remaining > 0 && _type == ORDER_TYPE.LIMIT) {
                amountToLock = (_side == ORDER_SIDE.BUY) 
                    ? amountToLock + (_price * remaining) / 1e18 
                    : amountToLock + remaining;
            }

            return amountToLock;
        }

    function createOrder(bytes32 _ticker, uint256 _amount, uint256 _price, ORDER_SIDE _side, ORDER_TYPE _orderType) 
        internal 
        returns (Order memory) {
            uint256[] memory fills;
            nextOrderId = nextOrderId + 1;

            Order memory newOrder = Order(nextOrderId, msg.sender, _side, _orderType, _ticker, _amount, fills, _price, block.timestamp);
            orderBook[_ticker][_side].push(newOrder);
            
            return newOrder;
        }
    
    function sortOrders(bytes32 _ticker, ORDER_SIDE _side) 
        internal {   
            Order[] storage orders = orderBook[_ticker][_side];
            uint256 index = (orders.length > 0) ? (orders.length - 1) : 0;
            
            while(index > 0) {
                if ((_side == ORDER_SIDE.SELL && orders[index - 1].price > orders[index].price)
                    || (_side == ORDER_SIDE.BUY && orders[index - 1].price < orders[index].price)
                ) {
                    switchOrderSorting(orders, index);
                } else if ((_side == ORDER_SIDE.SELL && orders[index - 1].price == orders[index].price && orders[index - 1].date > orders[index].date)
                    || (_side == ORDER_SIDE.BUY && orders[index - 1].price == orders[index].price && orders[index - 1].date < orders[index].date)
                ) {
                    switchOrderSorting(orders, index);
                }
                index = index - 1;
            }
        }
    
    function switchOrderSorting(Order[] storage orders, uint index) 
        internal {
            Order memory order = orders[index - 1];
            orders[index - 1] = orders[index];        
            orders[index] = order;
        }

    function matchOrders(Order storage _newOrder) 
        internal {
            Order[] storage oppositeOrders = orderBook[_newOrder.ticker][_newOrder.orderSide == ORDER_SIDE.BUY ? ORDER_SIDE.SELL : ORDER_SIDE.BUY];

            uint256 index;
            uint256 remaining = _newOrder.amount;

            while(index < oppositeOrders.length && remaining > 0) {
                if (_newOrder.orderType == ORDER_TYPE.LIMIT) {
                    if (_newOrder.orderSide == ORDER_SIDE.BUY && _newOrder.price >= oppositeOrders[index].price
                        || _newOrder.orderSide == ORDER_SIDE.SELL && _newOrder.price <= oppositeOrders[index].price
                    ) {
                        matchSingleOrder(_newOrder, oppositeOrders[index], remaining);
                    }
                } else {
                    matchSingleOrder(_newOrder, oppositeOrders[index], remaining);
                }

                remaining = _newOrder.amount - amountFilled(_newOrder);
                index = index + 1;
            }
        }
    
    function matchSingleOrder(Order storage _newOrder, Order storage _oppositeOrder, uint256 _remaining) 
        internal {
            uint256 orderAmountFilled = amountFilled(_oppositeOrder);
            uint256 available = _oppositeOrder.amount - orderAmountFilled;
            uint256 matched = (_remaining > available) ? available : _remaining;
            
            _oppositeOrder.fills.push(matched);
            _newOrder.fills.push(matched);

            adjustBalances(_newOrder, _oppositeOrder, matched);
            emitNewTradeEvent(_newOrder, _oppositeOrder, matched);
        }
    
    function adjustBalances(Order storage _newOrder, Order storage _oppositeOrder, uint256 _matched) 
        internal {
            uint256 finalPrice = (_matched * _oppositeOrder.price) / 1e18;

            if(_newOrder.orderSide == ORDER_SIDE.SELL) {
                balances[msg.sender][_newOrder.ticker].locked = balances[msg.sender][_newOrder.ticker].locked - _matched;
                balances[_oppositeOrder.traderAddress][quoteTicker].locked = balances[_oppositeOrder.traderAddress][quoteTicker].locked - finalPrice;

                balances[msg.sender][quoteTicker].free = balances[msg.sender][quoteTicker].free + finalPrice;
                balances[_oppositeOrder.traderAddress][_newOrder.ticker].free = balances[_oppositeOrder.traderAddress][_newOrder.ticker].free + _matched;
            } else if(_newOrder.orderSide == ORDER_SIDE.BUY) {
                balances[msg.sender][quoteTicker].locked = balances[msg.sender][quoteTicker].locked - finalPrice;
                balances[_oppositeOrder.traderAddress][_newOrder.ticker].locked = balances[_oppositeOrder.traderAddress][_newOrder.ticker].locked - _matched;

                balances[msg.sender][_newOrder.ticker].free = balances[msg.sender][_newOrder.ticker].free + _matched;
                balances[_oppositeOrder.traderAddress][quoteTicker].free = balances[_oppositeOrder.traderAddress][quoteTicker].free + finalPrice;
            }
        }
    
    function findOrderById(bytes32 _ticker, ORDER_SIDE _side, uint256 _orderId) 
        internal 
        view 
        returns (uint256) {
            Order[] storage orders = orderBook[_ticker][_side];

            uint256 orderIndex;
            bool orderFound = false;
            
            // Look for order index with id = _orderId
            for (uint256 i = 0; i < orders.length; i = i + 1) {
                if (orders[i].id == _orderId) {
                    orderIndex = i;
                    orderFound = true;
                    break;
                }
            }

            require(orderFound == true, "Order Not Found!");

            return orderIndex;
        }
    
    function cleanOrders(bytes32 _ticker) 
        internal {
            clearFilledOrdersSide(_ticker, ORDER_SIDE.BUY);
            clearFilledOrdersSide(_ticker, ORDER_SIDE.SELL);
        }

    function clearFilledOrdersSide(bytes32 _ticker, ORDER_SIDE _side) 
        internal {
            uint256 index = 0;
            Order[] storage orders = orderBook[_ticker][_side];
            
            while(index < orders.length) {
                bool isOffset = false;
                if (amountFilled(orders[index]) == orders[index].amount || orders[index].orderType == ORDER_TYPE.MARKET) {
                    for(uint256 j = index; j < orders.length - 1; j = j + 1) {
                        orders[j] = orders[j + 1];
                        isOffset = true;
                    }

                    orders.pop();
                }

                if(!isOffset) {
                    index = index + 1;
                }
            }
        }

    function amountFilled(Order memory _order) 
        internal 
        pure
        returns(uint256) {
            uint256 filledAmount;
            
            for (uint256 i; i < _order.fills.length; i = i + 1) {
                filledAmount = filledAmount + _order.fills[i];
            }

            return filledAmount;
        }
    
    function deduceMarketPrice(bytes32 _ticker, ORDER_SIDE _side) 
        internal 
        view 
        returns(uint256) {
            Order[] memory orders = orderBook[_ticker][_side == ORDER_SIDE.BUY ? ORDER_SIDE.SELL : ORDER_SIDE.BUY];
            return orders[0].price;
        }

    function cancelOrder(bytes32 _ticker, uint256 _orderId, ORDER_SIDE _side) 
        external 
        tokenExist(_ticker) 
        isNotQuoteTicker(_ticker) {
            Order[] storage orders = orderBook[_ticker][_side];
            uint256 orderIndex = findOrderById(_ticker, _side, _orderId);

            Order memory order = orders[orderIndex];

            require(order.orderType == ORDER_TYPE.LIMIT, "Only Limit Orders can be canceled");
            require(order.traderAddress == msg.sender, "Unauthorized!");

            bytes32 tickerToUnlock;
            uint256 amoutToUnlock;
            if (order.orderSide == ORDER_SIDE.BUY) {
                tickerToUnlock = quoteTicker;
                amoutToUnlock = (order.amount - amountFilled(order)) * order.price / 1e18;
            } else {
                tickerToUnlock = _ticker;
                amoutToUnlock = order.amount - amountFilled(order);
            }

            for (uint256 i = orderIndex; i < orders.length - 1; i = i + 1) {
                orders[i] = orders[i + 1];
            }

            orders.pop();

            if (amoutToUnlock > 0) {
                balances[msg.sender][tickerToUnlock].locked = balances[msg.sender][tickerToUnlock].locked - amoutToUnlock;
                balances[msg.sender][tickerToUnlock].free = balances[msg.sender][tickerToUnlock].free + amoutToUnlock;
            }
        }

    function emitNewTradeEvent(Order storage _orderToMatch, Order storage _oppositeOrder, uint256 _matched)
        internal {            
            nextTradeId = nextTradeId + 1;
            emit NewTrade(
                nextTradeId, 
                _oppositeOrder.id, 
                _orderToMatch.id, 
                _orderToMatch.ticker, 
                _oppositeOrder.traderAddress, 
                _orderToMatch.traderAddress, 
                _orderToMatch.orderType,
                _orderToMatch.orderSide,
                _matched, 
                _oppositeOrder.price, 
                block.timestamp
            );
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

    modifier hasEnoughBalance(bytes32 _ticker, uint256 _amount) {
        require(balances[msg.sender][_ticker].free >= _amount, "Low Balance!");
        _;
    }

    modifier placeOrderModifier(OrderParams memory _params) {
        // Token Exists
        require(tokens[_params.ticker].tokenAddress != address(0), "Ticker Does Not Exist!");

        // Token Enabled
        require(tokens[_params.ticker].isTradable == true, "Token Disabled!");

        // Quote Ticker Defined
        require(quoteTicker != bytes32(0), "Quote Ticker Undefined!");

        // Is Not Quote Ticker
        require(quoteTicker != _params.ticker, "Quote Ticker!");

        // Only Limit and Market Order Types Allowed
        require(_params.orderType == ORDER_TYPE.LIMIT || _params.orderType == ORDER_TYPE.MARKET, "Unkown Order Type!");

        // Only Buy and Sell Order Side Allowed
        require(_params.orderSide == ORDER_SIDE.BUY || _params.orderSide == ORDER_SIDE.SELL, "Unkown Order Side!");
        _;
    }

    modifier ordersExists(bytes32 _ticker, ORDER_SIDE _side, ORDER_TYPE _type) {
        // This should ONLY be checked on MARKET orders 
        // since we need opposite orders to exist for the matching to happen
        if (_type == ORDER_TYPE.MARKET) {
            Order[] memory orders = orderBook[_ticker][(_side == ORDER_SIDE.BUY ? ORDER_SIDE.SELL : ORDER_SIDE.BUY)];
            require(orders.length > 0, "Empty Order Book!");
        }
        _;
    }
}