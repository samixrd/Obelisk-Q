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

interface IZKRegimeVerifier {
    function verifyRegimeProof(
        uint256 fearGreed,
        int256 mntChange,
        uint256 prevVol,
        uint256 outVol,
        uint256 outRiskScore,
        uint8 outRegime,
        bytes calldata proof
    ) external view returns (bool);

    function updateVolatility(uint256 newVol) external;
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
    address public zkVerifier;

    uint256 public totalDeposited;
    bool    public vaultPaused;
    string  public currentRegime = "Expansion"; // Default
    bool    private _locked; // Reentrancy Guard state

    // Agent keeps this buffer for swap gas — never shown to users
    uint256 public constant AGENT_BUFFER = 0.01 ether;

    // Hardcoded WMNT address (avoids broken WETH() call on LB Router)
    address public constant WMNT = 0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8;

    // Tokens & Router (Mantle Mainnet)
    IRouter public constant ROUTER = IRouter(0xeaEE7EE68874218c3558b40063c42B82D3E7232a);
    mapping(address => bool) public isAssetAllowed;
    address[] public allowedAssets;

    mapping(address => uint256) public balances;
    address[] private depositors;

    // ── Constructor ───────────────────────────────────────────────────────
    constructor(address _agent, address[] memory _initialAssets) {
        owner = msg.sender;
        agent = _agent;
        for (uint i = 0; i < _initialAssets.length; i++) {
            _addAsset(_initialAssets[i]);
        }
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

    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call");
        _locked = true;
        _;
        _locked = false;
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

    function withdraw() external nonReentrant {
        _withdraw(balances[msg.sender]);
    }

    function withdraw(uint256 amount) external nonReentrant {
        _withdraw(amount);
    }

    function _withdraw(uint256 amount) internal {
        uint256 depositAmount = balances[msg.sender];
        require(depositAmount >= amount, "Insufficient balance");
        require(amount > 0, "No balance");

        // 1. Calculate user's share of each token and unwind ONLY that share
        for (uint i = 0; i < allowedAssets.length; i++) {
            address token = allowedAssets[i];
            uint256 share = (IERC20(token).balanceOf(address(this)) * amount) / totalDeposited;
            if (share > 0) _unwindToken(token, share, 0);
        }

        // 2. Calculate user's share of the raw MNT in the vault
        uint256 vaultMnt = address(this).balance;
        uint256 mntShare = (vaultMnt * amount) / totalDeposited;

        // 3. Final payout (share of unwound assets + share of MNT)
        uint256 toPay = mntShare;
        if (toPay > AGENT_BUFFER) {
            toPay -= AGENT_BUFFER;
        } else {
            toPay = 0;
        }

        // Clear user state
        totalDeposited -= amount;
        balances[msg.sender] -= amount;

        (bool ok, ) = payable(msg.sender).call{value: toPay}("");
        require(ok, "Transfer failed");

        emit Withdrawn(msg.sender, toPay, block.timestamp);
    }

    // ── Agent Actions ─────────────────────────────────────────────────────

    function rebalance(address targetToken, uint256 minAmountOut) external payable onlyAgent nonReentrant {
        if (targetToken == address(0)) {
            // Unwind everything to MNT
            for (uint i = 0; i < allowedAssets.length; i++) {
                _unwindToken(allowedAssets[i], type(uint256).max, 0);
            }
        } else {
            require(isAssetAllowed[targetToken], "Asset not registered");
            // 1. Unwind OTHER tokens if we have any
            for (uint i = 0; i < allowedAssets.length; i++) {
                address token = allowedAssets[i];
                if (token != targetToken) {
                    _unwindToken(token, type(uint256).max, 0);
                }
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
                    minAmountOut, 
                    path, 
                    address(this), 
                    block.timestamp + 600
                );

                emit Rebalanced(targetToken, amountToSwap, amounts[1]);
            }
        }
    }

    /**
     * @notice Harvests any loose MNT in the vault and compounds it into the target asset.
     * @param targetToken The asset to compound into.
     * @param minAmountOut Slippage protection.
     */
    function compound(address targetToken, uint256 minAmountOut) external onlyAgent nonReentrant {
        require(isAssetAllowed[targetToken], "Asset not registered");
        uint256 mntToCompound = address(this).balance;
        if (mntToCompound > AGENT_BUFFER) {
            uint256 amountToSwap = mntToCompound - AGENT_BUFFER;
            address[] memory path = new address[](2);
            path[0] = WMNT;
            path[1] = targetToken;
            
            ROUTER.swapExactNativeForTokens{value: amountToSwap}(
                minAmountOut,
                path,
                address(this),
                block.timestamp + 600
            );
        }
    }

    function setRegime(string calldata _regime) external onlyAgent {
        currentRegime = _regime;
        emit RegimeUpdated(_regime, block.timestamp);
    }

    function setZKVerifier(address _zkVerifier) external onlyOwner {
        zkVerifier = _zkVerifier;
    }

    /**
     * @notice Allows verified on-chain execution of regime detection updates without a trusted supervisor.
     * @dev Anyone can call this function if they provide a valid ZK-proof of the HMM regime-detection calculation.
     */
    function setRegimeWithZKProof(
        uint256 fearGreed,
        int256 mntChange,
        uint256 prevVol,
        uint256 outVol,
        uint256 outRiskScore,
        uint8 outRegime,
        bytes calldata proof
    ) external {
        require(zkVerifier != address(0), "ZK verifier not set");
        
        bool isValid = IZKRegimeVerifier(zkVerifier).verifyRegimeProof(
            fearGreed,
            mntChange,
            prevVol,
            outVol,
            outRiskScore,
            outRegime,
            proof
        );
        require(isValid, "Invalid ZK proof");

        // Update volatility tracking on verifier
        IZKRegimeVerifier(zkVerifier).updateVolatility(outVol);

        string memory newRegime;
        if (outRegime == 0) {
            newRegime = "Expansion";
        } else if (outRegime == 1) {
            newRegime = "Consolidation";
        } else if (outRegime == 2) {
            newRegime = "Contraction";
        } else {
            revert("Invalid output regime");
        }

        currentRegime = newRegime;
        emit RegimeUpdated(newRegime, block.timestamp);
    }

    // ── Internal ──────────────────────────────────────────────────────────

    function _unwindToken(address token, uint256 amount, uint256 minAmountOut) internal {
        uint256 tokenBal = IERC20(token).balanceOf(address(this));
        if (tokenBal == 0 || amount == 0) return;
        
        uint256 toUnwind = amount > tokenBal ? tokenBal : amount;

        if (token == WMNT) {
            (bool success, ) = WMNT.call(abi.encodeWithSignature("withdraw(uint256)", toUnwind));
            require(success, "WMNT unwrap failed");
            return;
        }

        address[] memory path = new address[](2);
        path[0] = token;
        path[1] = WMNT;

        IERC20(token).approve(address(ROUTER), toUnwind);
        
        ROUTER.swapExactTokensForNative(
            toUnwind,
            minAmountOut,
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

    function togglePause() external onlyAgent {
        vaultPaused = !vaultPaused;
    }

    function addAsset(address token) external onlyOwner {
        _addAsset(token);
    }

    function removeAsset(address token) external onlyOwner {
        require(isAssetAllowed[token], "Not registered");
        isAssetAllowed[token] = false;
        // Remove from array (swap with last)
        for (uint i = 0; i < allowedAssets.length; i++) {
            if (allowedAssets[i] == token) {
                allowedAssets[i] = allowedAssets[allowedAssets.length - 1];
                allowedAssets.pop();
                break;
            }
        }
    }

    function _addAsset(address token) internal {
        if (!isAssetAllowed[token]) {
            isAssetAllowed[token] = true;
            allowedAssets.push(token);
        }
    }

    /// @notice Allows the owner to rescue accidentally sent ERC20 tokens.
    ///         Cannot be used to rescue the vault's primary managed assets.
    function rescueERC20(address token, uint256 amount) external onlyOwner {
        require(!isAssetAllowed[token], "ObeliskVault: cannot rescue managed assets");
        IERC20(token).transfer(owner, amount);
    }

    // ── View ──────────────────────────────────────────────────────────────

    /// @notice Returns the raw deposit amount (legacy)
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    /// @notice Returns the total value of all assets held by the vault
    function getTotalVaultValue() public view returns (uint256) {
        uint256 total = address(this).balance;
        for (uint i = 0; i < allowedAssets.length; i++) {
            total += IERC20(allowedAssets[i]).balanceOf(address(this));
        }
        return total;
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
