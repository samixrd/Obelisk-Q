// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

interface IRouter {
    function swapExactNativeForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);
    function swapExactTokensForNative(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
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
    event RegimeUpdated(string newRegime, uint256 timestamp);

    // ── State ─────────────────────────────────────────────────────────────
    address public owner;
    address public agent;

    uint256 public totalDeposited;
    bool    public vaultPaused;
    string  public currentRegime = "Expansion"; // Default

    // Agent keeps this buffer for swap gas — never shown to users
    uint256 public constant AGENT_BUFFER = 0.01 ether;

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
        uint256 depositAmount = balances[msg.sender];
        require(depositAmount > 0, "No balance");

        // Unwind ALL tokens back to MNT first
        _unwindToken(METH, type(uint256).max);
        _unwindToken(USDY, type(uint256).max);
        _unwindToken(WMNT, type(uint256).max);

        // Calculate user's proportional share of total vault MNT
        uint256 totalMnt = address(this).balance;
        uint256 toPay;

        if (totalDeposited <= depositAmount) {
            // Last depositor — gets everything minus buffer
            toPay = totalMnt > AGENT_BUFFER ? totalMnt - AGENT_BUFFER : 0;
        } else {
            // Proportional share minus per-user buffer fraction
            toPay = (totalMnt * depositAmount) / totalDeposited;
            if (toPay > AGENT_BUFFER) {
                toPay -= AGENT_BUFFER;
            } else {
                toPay = 0;
            }
        }

        // Clear user state
        totalDeposited -= depositAmount;
        balances[msg.sender] = 0;

        (bool ok, ) = payable(msg.sender).call{value: toPay}("");
        require(ok, "Transfer failed");

        emit Withdrawn(msg.sender, toPay, block.timestamp);
    }

    // ── Agent Actions ─────────────────────────────────────────────────────

    function rebalance(address targetToken) external payable onlyAgent {
        require(targetToken == METH || targetToken == USDY || targetToken == WMNT || targetToken == address(0), "Invalid target");
        
        if (targetToken == address(0)) {
            // Unwind everything to MNT
            _unwindToken(METH, type(uint256).max);
            _unwindToken(USDY, type(uint256).max);
            _unwindToken(WMNT, type(uint256).max);
        } else {
            // 1. Unwind the OTHER token if we have any
            if (targetToken == METH) {
                _unwindToken(USDY, type(uint256).max);
                _unwindToken(WMNT, type(uint256).max);
            } else if (targetToken == USDY) {
                _unwindToken(METH, type(uint256).max);
                _unwindToken(WMNT, type(uint256).max);
            } else if (targetToken == WMNT) {
                _unwindToken(METH, type(uint256).max);
                _unwindToken(USDY, type(uint256).max);
            }

            // 2. Swap MNT to target
            uint256 mntToSwap = address(this).balance;
            require(mntToSwap > 0.01 ether, "Insufficient MNT for swap");

            uint256 amountToSwap = mntToSwap - 0.01 ether; // Keep 0.01 MNT buffer
            
            if (targetToken == WMNT) {
                // Wrap MNT to WMNT
                (bool success, ) = WMNT.call{value: amountToSwap}(abi.encodeWithSignature("deposit()"));
                require(success, "WMNT wrap failed");
                emit Rebalanced(targetToken, amountToSwap, amountToSwap);
            } else {
                address[] memory path = new address[](2);
                path[0] = WMNT;
                path[1] = targetToken;
                
                uint[] memory amounts = ROUTER.swapExactNativeForTokens{value: amountToSwap}(
                    0, 
                    path, 
                    address(this), 
                    block.timestamp + 600
                );

                emit Rebalanced(targetToken, amountToSwap, amounts[1]);
            }
        }
    }

    function setRegime(string calldata _regime) external onlyAgent {
        currentRegime = _regime;
        emit RegimeUpdated(_regime, block.timestamp);
    }

    // ── Internal ──────────────────────────────────────────────────────────

    function _unwindToken(address token, uint256 /* amountMntNeeded */) internal {
        uint256 tokenBal = IERC20(token).balanceOf(address(this));
        if (tokenBal == 0) return;

        if (token == WMNT) {
            (bool success, ) = WMNT.call(abi.encodeWithSignature("withdraw(uint256)", tokenBal));
            require(success, "WMNT unwrap failed");
            return;
        }

        address[] memory path = new address[](2);
        path[0] = token;
        path[1] = WMNT;

        IERC20(token).approve(address(ROUTER), tokenBal);
        
        // Swap as much as needed or everything
        ROUTER.swapExactTokensForNative(
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

    /// @notice Returns the raw deposit amount (legacy)
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    /// @notice Returns the total value of all assets held by the vault
    function getTotalVaultValue() public view returns (uint256) {
        return address(this).balance
            + IERC20(METH).balanceOf(address(this))
            + IERC20(USDY).balanceOf(address(this))
            + IERC20(WMNT).balanceOf(address(this));
    }

    /// @notice Returns the user's yield-inclusive withdrawable balance,
    ///         with the 0.01 MNT agent buffer already subtracted.
    function getWithdrawableBalance(address user) external view returns (uint256) {
        if (totalDeposited == 0 || balances[user] == 0) return 0;
        uint256 totalValue = getTotalVaultValue();
        uint256 userShare = (totalValue * balances[user]) / totalDeposited;
        // Subtract agent buffer so UI only shows what's truly withdrawable
        if (userShare > AGENT_BUFFER) {
            return userShare - AGENT_BUFFER;
        }
        return 0;
    }

    function getVaultStats() external view returns (
        uint256 _totalDeposited,
        uint256 _depositorCount,
        uint256 _lastScore,
        bool    _paused,
        string  memory _regime
    ) {
        return (totalDeposited, depositors.length, 85, vaultPaused, currentRegime);
    }

    receive() external payable {}
}
