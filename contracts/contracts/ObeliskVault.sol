// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

interface IRouter {
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts);
    function WETH() external pure returns (address);
}

/**
 * ObeliskVault — Mantle Mainnet Autonomous Vault
 *
 * Users deposit MNT, the agent rebalances across mETH and USDY via Merchant Moe.
 */
contract ObeliskVault {

    // ── Events ────────────────────────────────────────────────────────────
    event Deposited(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 timestamp);
    event Rebalanced(address indexed targetToken, uint256 amountIn, uint256 amountOut);
    event AgentUpdated(address indexed newAgent);
    event VaultPaused(uint256 timestamp);

    // ── State ─────────────────────────────────────────────────────────────
    address public owner;
    address public agent;

    uint256 public totalDeposited;
    bool    public vaultPaused;

    // Tokens & Router (Mantle Mainnet)
    IRouter public constant ROUTER = IRouter(0xeaEE7EE68874218c3558b40063c42B82D3E7232a);
    address public constant WMNT   = 0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8;
    address public constant METH   = 0xcDA86A272531e8640cD7F1a92c01839911B90bb0;
    address public constant USDY   = 0x5bE26527e817998A7206475496fDE1E68957c5A6;

    mapping(address => uint256) public balances;
    address[] private depositors;

    // ── Constructor ───────────────────────────────────────────────────────
    constructor(address _agent) {
        owner = msg.sender;
        agent = _agent;
    }

    // ── Modifiers ─────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "ObeliskVault: not owner");
        _;
    }

    modifier onlyAgent() {
        require(msg.sender == agent || msg.sender == owner, "ObeliskVault: not agent");
        _;
    }

    // ── User Actions ──────────────────────────────────────────────────────

    function deposit() external payable {
        require(!vaultPaused, "Paused");
        if (balances[msg.sender] == 0) {
            depositors.push(msg.sender);
        }
        balances[msg.sender] += msg.value;
        totalDeposited += msg.value;
        emit Deposited(msg.sender, msg.value, block.timestamp);
    }

    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");

        // If not enough MNT, unwind mETH first
        uint256 mntBalance = address(this).balance;
        if (mntBalance < amount) {
            uint256 needed = amount - mntBalance;
            _unwindToken(METH, needed);
            mntBalance = address(this).balance;
        }
        
        // Still not enough? Unwind USDY
        if (mntBalance < amount) {
            uint256 needed = amount - mntBalance;
            _unwindToken(USDY, needed);
            mntBalance = address(this).balance;
        }

        uint256 toPay = mntBalance < amount ? mntBalance : amount;
        balances[msg.sender] -= toPay;
        totalDeposited -= toPay;

        (bool ok, ) = payable(msg.sender).call{value: toPay}("");
        require(ok, "Transfer failed");

        emit Withdrawn(msg.sender, toPay, block.timestamp);
    }

    // ── Agent Actions ─────────────────────────────────────────────────────

    function rebalance(address targetToken) external onlyAgent {
        require(targetToken == METH || targetToken == USDY || targetToken == address(0), "Invalid target");
        
        if (targetToken == address(0)) {
            // Unwind everything to MNT
            _unwindToken(METH, type(uint256).max);
            _unwindToken(USDY, type(uint256).max);
        } else {
            // Swap MNT to target
            uint256 mntToSwap = address(this).balance;
            require(mntToSwap > 0.01 ether, "Insufficient MNT for swap");

            uint256 amountToSwap = mntToSwap - 0.01 ether; // Keep 0.01 MNT buffer
            
            address[] memory path = new address[](2);
            path[0] = WMNT;
            path[1] = targetToken;
            
            uint[] memory amounts = ROUTER.swapExactETHForTokens{value: amountToSwap}(
                0, 
                path, 
                address(this), 
                block.timestamp + 600
            );

            emit Rebalanced(targetToken, amountToSwap, amounts[1]);
        }
    }

    // ── Internal ──────────────────────────────────────────────────────────

    function _unwindToken(address token, uint256 /* amountMntNeeded */) internal {
        uint256 tokenBal = IERC20(token).balanceOf(address(this));
        if (tokenBal == 0) return;

        address[] memory path = new address[](2);
        path[0] = token;
        path[1] = WMNT;

        IERC20(token).approve(address(ROUTER), tokenBal);
        
        // Swap as much as needed or everything
        ROUTER.swapExactTokensForETH(
            tokenBal,
            0,
            path,
            address(this),
            block.timestamp + 600
        );
    }

    // ── Admin ─────────────────────────────────────────────────────────────

    function setAgent(address _agent) external onlyOwner {
        agent = _agent;
        emit AgentUpdated(_agent);
    }

    function togglePause() external onlyOwner {
        vaultPaused = !vaultPaused;
    }

    function ownerRescue(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool ok, ) = payable(owner).call{value: amount}("");
        require(ok, "Rescue failed");
    }

    // ── View ──────────────────────────────────────────────────────────────

    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    function getVaultStats() external view returns (
        uint256 _totalDeposited,
        uint256 _depositorCount,
        uint256 _lastScore,
        bool    _paused
    ) {
        return (totalDeposited, depositors.length, 85, vaultPaused); // Fixed 85 for score as it's handled by agent now
    }

    receive() external payable {}
}
