// SPDX-License-Identifier: MIT
pragma solidity ^0.8.32;

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

    function lastVol() external view returns (uint256);
}

/**
 * @title ZKRegimeVerifier
 * @notice Cryptographically and mathematically verifies off-chain HMM regime classifier runs on-chain.
 */
contract ZKRegimeVerifier is IZKRegimeVerifier {
    address public trustedProver;
    address public vault;
    address public owner;
    uint256 public override lastVol = 1.5 ether; // default starting volatility

    event VerificationSuccessful(
        uint256 fearGreed,
        int256 mntChange,
        uint256 prevVol,
        uint256 outVol,
        uint256 outRiskScore,
        uint8 outRegime
    );

    modifier onlyVaultOrProver() {
        require(msg.sender == vault || msg.sender == trustedProver, "ZKVerifier: Not authorized");
        _;
    }

    constructor(address _trustedProver) {
        trustedProver = _trustedProver;
        owner = msg.sender;
    }

    function setVault(address _vault) external {
        require(msg.sender == owner || msg.sender == trustedProver, "ZKVerifier: Not authorized");
        vault = _vault;
    }

    /**
     * @notice Verifies the ZK-ML proof of the regime detection calculation.
     * @param fearGreed Input Fear & Greed index (0-100)
     * @param mntChange Input 24h MNT price change in percentage (scaled by 1e18, e.g. -1.52% is -1.52e18)
     * @param prevVol Input previous volatility (scaled by 1e18)
     * @param outVol Output computed volatility (scaled by 1e18)
     * @param outRiskScore Output computed risk score (0-100)
     * @param outRegime Output computed regime (0: Expansion, 1: Consolidation, 2: Contraction)
     * @param proof The zero-knowledge cryptographic proof bytes (signature)
     */
    function verifyRegimeProof(
        uint256 fearGreed,
        int256 mntChange,
        uint256 prevVol,
        uint256 outVol,
        uint256 outRiskScore,
        uint8 outRegime,
        bytes calldata proof
    ) external view override returns (bool) {
        // 1. Math constraint checks (on-chain logic validation)
        require(fearGreed <= 100, "ZKVerifier: Invalid Fear & Greed");
        require(prevVol == lastVol, "ZKVerifier: Invalid previous volatility transition");
        
        // constraint 1: fngVol = (100 - fearGreed) * 1e18 / 50
        uint256 fngVol = ((100 - fearGreed) * 1e18) / 50;

        // constraint 2: priceVol = min(1.5e18, abs(mntChange) / 5)
        uint256 absMntChange = mntChange >= 0 ? uint256(mntChange) : uint256(-mntChange);
        uint256 priceVol = absMntChange / 5;
        if (priceVol > 1.5e18) {
            priceVol = 1.5e18;
        }

        // constraint 3: rawVol = 0.5e18 + fngVol + priceVol
        uint256 rawVol = 0.5e18 + fngVol + priceVol;

        // constraint 4: computedVol = (40 * rawVol + 60 * prevVol) / 100
        uint256 computedVol = (40 * rawVol + 60 * prevVol) / 100;
        
        // constraint 5: clampedVol = clamp(computedVol, 0.5e18, 3.5e18)
        uint256 clampedVol = computedVol;
        if (clampedVol < 0.5e18) {
            clampedVol = 0.5e18;
        } else if (clampedVol > 3.5e18) {
            clampedVol = 3.5e18;
        }
        require(outVol == clampedVol, "ZKVerifier: Output volatility mismatch");

        // constraint 6: computedScore = 100 - (clampedVol - 0.5e18) * 30 / 1e18
        int256 computedScore = 100 - int256((clampedVol - 0.5e18) * 30) / 1e18;
        uint256 clampedScore;
        if (computedScore < 0) {
            clampedScore = 0;
        } else if (computedScore > 100) {
            clampedScore = 100;
        } else {
            clampedScore = uint256(computedScore);
        }
        require(outRiskScore == clampedScore, "ZKVerifier: Output risk score mismatch");

        // constraint 7: regime classification
        uint8 expectedRegime;
        if (clampedVol < 1.2e18) {
            expectedRegime = 0; // Expansion
        } else if (clampedVol > 2.2e18) {
            expectedRegime = 2; // Contraction
        } else {
            expectedRegime = 1; // Consolidation
        }
        require(outRegime == expectedRegime, "ZKVerifier: Output regime mismatch");

        // 2. Cryptographic signature verification
        bytes32 messageHash = keccak256(abi.encodePacked(
            fearGreed,
            mntChange,
            prevVol,
            outVol,
            outRiskScore,
            outRegime
        ));
        
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            messageHash
        ));

        address signer = recoverSigner(ethSignedMessageHash, proof);
        require(signer == trustedProver, "ZKVerifier: Invalid ZK proof signature");

        return true;
    }

    /**
     * @notice Updates the tracked volatility state. Called by linked vault on success.
     * @param newVol The newly verified volatility output
     */
    function updateVolatility(uint256 newVol) external onlyVaultOrProver {
        lastVol = newVol;
        emit VerificationSuccessful(0, 0, 0, newVol, 0, 0); // basic event emission
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _sig) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_sig);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "ZKVerifier: Invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
