const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ObeliskVault Unit Tests", function () {
  let vault, verifier, owner, agent, user1, user2, rogueSigner;
  let mockToken1, mockToken2, mockRouter;
  let wmntAddress;

  // Helper to generate ZK proofs
  async function generateZKProof(fearGreed, mntChange, prevVol, outVol, outRiskScore, outRegime, signer) {
    const messageHash = ethers.solidityPackedKeccak256(
      ["uint256", "int256", "uint256", "uint256", "uint256", "uint8"],
      [fearGreed, mntChange, prevVol, outVol, outRiskScore, outRegime]
    );
    const signature = await signer.signMessage(ethers.getBytes(messageHash));
    return signature;
  }

  beforeEach(async function () {
    [owner, agent, user1, user2, rogueSigner] = await ethers.getSigners();

    // 1. Mock ERC20 Tokens
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockToken1 = await MockERC20.deploy("Mock Token 1", "MT1");
    mockToken2 = await MockERC20.deploy("Mock Token 2", "MT2");
    
    // 2. Mock Router (Minimal implementation for testing)
    const MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.deploy();
    wmntAddress = await mockRouter.WETH();

    // 3. Deploy ZK verifier (agent is the trusted prover)
    const ZKRegimeVerifier = await ethers.getContractFactory("ZKRegimeVerifier");
    verifier = await ZKRegimeVerifier.deploy(agent.address);

    // 4. Deploy Vault
    const ObeliskVault = await ethers.getContractFactory("ObeliskVault");
    vault = await ObeliskVault.deploy(agent.address, [mockToken1.target, mockToken2.target]);

    // 5. Link contracts
    await vault.connect(owner).setZKVerifier(verifier.target);
    await verifier.connect(agent).setVault(vault.target);
  });

  describe("Deployment", function () {
    it("Should set the right owner and agent", async function () {
      expect(await vault.owner()).to.equal(owner.address);
      expect(await vault.agent()).to.equal(agent.address);
    });

    it("Should register initial assets", async function () {
      expect(await vault.isAssetAllowed(mockToken1.target)).to.be.true;
      expect(await vault.isAssetAllowed(mockToken2.target)).to.be.true;
    });

    it("Should set the correct ZK verifier", async function () {
      expect(await vault.zkVerifier()).to.equal(verifier.target);
    });
  });

  describe("Deposits", function () {
    it("Should allow users to deposit MNT", async function () {
      const depositAmount = ethers.parseEther("1.0");
      await vault.connect(user1).deposit({ value: depositAmount });

      expect(await vault.balances(user1.address)).to.equal(depositAmount);
      expect(await vault.totalDeposited()).to.equal(depositAmount);
    });

    it("Should fail if vault is paused", async function () {
      await vault.connect(agent).togglePause();
      await expect(
        vault.connect(user1).deposit({ value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Paused");
    });
  });

  describe("Withdrawals (Full and Partial)", function () {
    beforeEach(async function () {
      const depositAmount = ethers.parseEther("2.0");
      await vault.connect(user1).deposit({ value: depositAmount });
    });

    it("Should support full withdrawal", async function () {
      const balanceBefore = await ethers.provider.getBalance(user1.address);
      const tx = await vault.connect(user1)["withdraw()"]();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      expect(await vault.balances(user1.address)).to.equal(0);
      expect(await vault.totalDeposited()).to.equal(0);

      const balanceAfter = await ethers.provider.getBalance(user1.address);
      // Payout should be deposit amount minus buffer (0.01 ether) minus gas
      const expectedPayout = ethers.parseEther("1.99");
      expect(balanceAfter).to.equal(balanceBefore + expectedPayout - gasUsed);
    });

    it("Should support partial withdrawal", async function () {
      const balanceBefore = await ethers.provider.getBalance(user1.address);
      const partialAmount = ethers.parseEther("0.8");
      
      const tx = await vault.connect(user1)["withdraw(uint256)"](partialAmount);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      expect(await vault.balances(user1.address)).to.equal(ethers.parseEther("1.2"));
      expect(await vault.totalDeposited()).to.equal(ethers.parseEther("1.2"));

      const balanceAfter = await ethers.provider.getBalance(user1.address);
      // Payout should be partial amount minus buffer (0.01 ether) minus gas
      const expectedPayout = ethers.parseEther("0.79");
      expect(balanceAfter).to.equal(balanceBefore + expectedPayout - gasUsed);
    });

    it("Should reject withdrawal exceeding balance", async function () {
      await expect(
        vault.connect(user1)["withdraw(uint256)"](ethers.parseEther("2.1"))
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("ZK-ML Regime Verification", function () {
    // Math checks for the HMM volatility algorithm:
    // fngVol = (100 - fearGreed) * 1e18 / 50
    // priceVol = min(1.5e18, abs(mntChange) / 5) -> mntChange is scaled by 1e18
    // rawVol = 0.5e18 + fngVol + priceVol
    // computedVol = (40 * rawVol + 60 * prevVol) / 100
    // clampedVol = clamp(computedVol, 0.5e18, 3.5e18)
    // riskScore = 100 - (clampedVol - 0.5e18) * 30 / 1e18
    // regime: < 1.2e18 -> 0 (Exp), > 2.2e18 -> 2 (Ctr), else 1 (Con)

    it("Should verify correct ZK-ML proof and update regime", async function () {
      // Inputs:
      // fearGreed = 60
      // mntChange = 5% (5e18)
      // prevVol = 1.5e18 (default lastVol)
      //
      // Math:
      // fngVol = (100 - 60) * 1e18 / 50 = 0.8e18
      // priceVol = (5e18) / 5 = 1.0e18 (less than 1.5e18 limit)
      // rawVol = 0.5e18 + 0.8e18 + 1.0e18 = 2.3e18
      // computedVol = (40 * 2.3e18 + 60 * 1.5e18) / 100 = (92e18 + 90e18) / 100 = 1.82e18
      // clampedVol = 1.82e18 (fits in bounds)
      // outVol = 1.82e18
      // outRiskScore = 100 - ((1.82e18 - 0.5e18) * 30 / 1e18) = 100 - (1.32e18 * 30 / 1e18) = 100 - 39 = 61
      // outRegime = 1 (since 1.82e18 is between 1.2e18 and 2.2e18 -> Consolidation)
      
      const fearGreed = 60n;
      const mntChange = ethers.parseEther("5"); // 5%
      const prevVol = ethers.parseEther("1.5");
      const outVol = ethers.parseEther("1.82");
      const outRiskScore = 61n;
      const outRegime = 1; // Consolidation

      const proof = await generateZKProof(
        fearGreed,
        mntChange,
        prevVol,
        outVol,
        outRiskScore,
        outRegime,
        agent
      );

      // Verify that anyone (like user1) can submit this verified proof
      await expect(
        vault.connect(user1).setRegimeWithZKProof(
          fearGreed,
          mntChange,
          prevVol,
          outVol,
          outRiskScore,
          outRegime,
          proof
        )
      ).to.emit(vault, "RegimeUpdated").withArgs("Consolidation", anyUint => true);

      expect(await vault.currentRegime()).to.equal("Consolidation");
      expect(await verifier.lastVol()).to.equal(outVol);
    });

    it("Should reject ZK-ML proof with incorrect math", async function () {
      const fearGreed = 60n;
      const mntChange = ethers.parseEther("5");
      const prevVol = ethers.parseEther("1.5");
      const outVol = ethers.parseEther("1.82");
      const outRiskScore = 62n; // Incorrect score (should be 61)
      const outRegime = 1;

      const proof = await generateZKProof(
        fearGreed,
        mntChange,
        prevVol,
        outVol,
        outRiskScore,
        outRegime,
        agent
      );

      await expect(
        vault.connect(user1).setRegimeWithZKProof(
          fearGreed,
          mntChange,
          prevVol,
          outVol,
          outRiskScore,
          outRegime,
          proof
        )
      ).to.be.revertedWith("ZKVerifier: Output risk score mismatch");
    });

    it("Should reject ZK-ML proof signed by unauthorized rogue prover", async function () {
      const fearGreed = 60n;
      const mntChange = ethers.parseEther("5");
      const prevVol = ethers.parseEther("1.5");
      const outVol = ethers.parseEther("1.82");
      const outRiskScore = 61n;
      const outRegime = 1;

      const proof = await generateZKProof(
        fearGreed,
        mntChange,
        prevVol,
        outVol,
        outRiskScore,
        outRegime,
        rogueSigner
      );

      await expect(
        vault.connect(user1).setRegimeWithZKProof(
          fearGreed,
          mntChange,
          prevVol,
          outVol,
          outRiskScore,
          outRegime,
          proof
        )
      ).to.be.revertedWith("ZKVerifier: Invalid ZK proof signature");
    });

    it("Should reject ZK-ML proof with invalid state transition (wrong prevVol)", async function () {
      const fearGreed = 60n;
      const mntChange = ethers.parseEther("5");
      const prevVol = ethers.parseEther("1.4"); // Should be 1.5
      const outVol = ethers.parseEther("1.78"); // Calculated using 1.4 prevVol
      const outRiskScore = 61n;
      const outRegime = 1;

      const proof = await generateZKProof(
        fearGreed,
        mntChange,
        prevVol,
        outVol,
        outRiskScore,
        outRegime,
        agent
      );

      await expect(
        vault.connect(user1).setRegimeWithZKProof(
          fearGreed,
          mntChange,
          prevVol,
          outVol,
          outRiskScore,
          outRegime,
          proof
        )
      ).to.be.revertedWith("ZKVerifier: Invalid previous volatility transition");
    });
  });
});
