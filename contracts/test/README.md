# ─── Obelisk Q: Smart Contract Test Suite ───────────────────────────────

This directory contains the unit tests for the `ObeliskVault.sol` contract, ensuring operational safety for the autonomous financial engine.

## 🧪 Running Tests

To execute the test suite, run:

```bash
cd contracts
npx hardhat test
```

## 🛡️ Coverage Areas

- **Asset Management**: Verifies that only authorized assets can be added/removed by the owner.
- **Deposit/Withdraw**: Validates balance tracking and the 0.01 MNT gas buffer preservation.
- **Permissions**: Enforces `onlyOwner` and `onlyAgent` modifiers.
- **Emergency Controls**: Tests the pause/unpause functionality.

## 🚧 Roadmap for Integration Tests

Full integration tests involving the **Merchant Moe** swap router require a Mantle Network fork. You can run these by configuring a forking block in `hardhat.config.js` and running:

```bash
npx hardhat test --network hardhat
```
