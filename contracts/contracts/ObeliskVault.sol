// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * ObeliskVault — Mantle Testnet Investment Vault
 *
 * Users deposit MNT, the agent allocates based on the confidence score.
 * The vault tracks each depositor's balance and allows withdrawal at any time.
 *
 * Deployment target: Mantle Sepolia Testnet (Chain ID: 5003)
 */
contract ObeliskVault {

    // ── Events ────────────────────────────────────────────────────────────
    event Deposited(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 timestamp);
    event AllocationUpdated(uint256 confidenceScore, bool rebalanced, uint256 timestamp);
    event AgentUpdated(address indexed newAgent);
    event VaultPaused(uint256 timestamp);
    event VaultResumed(uint256 timestamp);

    // ── State ─────────────────────────────────────────────────────────────
    address public owner;
    address public agent;

    uint256 public totalDeposited;
    uint256 public lastConfidenceScore;
    uint256 public lastRebalanceTimestamp;
    bool    public vaultPaused;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public depositTimestamps;
    address[] private depositors;

    // ── Constants ─────────────────────────────────────────────────────────
    uint256 public constant MIN_DEPOSIT     = 0.001 ether;
    uint256 public constant CIRCUIT_BREAKER = 5;

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
        require(
            msg.sender == agent || msg.sender == owner,
            "ObeliskVault: not agent"
        );
        _;
    }

    modifier notPaused() {
        require(!vaultPaused, "ObeliskVault: vault is paused");
        _;
    }

    // ── User Actions ──────────────────────────────────────────────────────

    function deposit() external payable notPaused {
        require(msg.value >= MIN_DEPOSIT, "ObeliskVault: below minimum deposit");

        if (balances[msg.sender] == 0) {
            depositors.push(msg.sender);
        }

        balances[msg.sender]         += msg.value;
        depositTimestamps[msg.sender]  = block.timestamp;
        totalDeposited                += msg.value;

        emit Deposited(msg.sender, msg.value, block.timestamp);
    }

    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "ObeliskVault: nothing to withdraw");

        balances[msg.sender]  = 0;
        totalDeposited       -= amount;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "ObeliskVault: transfer failed");

        emit Withdrawn(msg.sender, amount, block.timestamp);
    }

    function withdrawPartial(uint256 amount) external {
        require(balances[msg.sender] >= amount, "ObeliskVault: insufficient balance");
        require(amount > 0, "ObeliskVault: zero amount");

        balances[msg.sender]  -= amount;
        totalDeposited        -= amount;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "ObeliskVault: transfer failed");

        emit Withdrawn(msg.sender, amount, block.timestamp);
    }

    // ── Agent Actions ─────────────────────────────────────────────────────

    function recordAllocation(
        uint256 confidenceScore,
        bool    shouldRebalance
    ) external onlyAgent {
        if (
            lastConfidenceScore > CIRCUIT_BREAKER &&
            confidenceScore < lastConfidenceScore - CIRCUIT_BREAKER
        ) {
            vaultPaused = true;
            emit VaultPaused(block.timestamp);
        }

        lastConfidenceScore    = confidenceScore;
        lastRebalanceTimestamp = block.timestamp;

        emit AllocationUpdated(confidenceScore, shouldRebalance, block.timestamp);
    }

    // ── Admin ─────────────────────────────────────────────────────────────

    function resumeVault() external onlyOwner {
        vaultPaused = false;
        emit VaultResumed(block.timestamp);
    }

    function pauseVault() external onlyOwner {
        vaultPaused = true;
        emit VaultPaused(block.timestamp);
    }

    function setAgent(address _agent) external onlyOwner {
        require(_agent != address(0), "ObeliskVault: zero address");
        agent = _agent;
        emit AgentUpdated(_agent);
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
        return (totalDeposited, depositors.length, lastConfidenceScore, vaultPaused);
    }

    receive() external payable {}
}
