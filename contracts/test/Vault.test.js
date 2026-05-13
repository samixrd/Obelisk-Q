const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ObeliskVault Unit Tests", function () {
  let vault, owner, agent, user1, user2;
  let mockToken1, mockToken2, mockRouter;
  let wmntAddress;

  beforeEach(async function () {
    [owner, agent, user1, user2] = await ethers.getSigners();

    // 1. Mock ERC20 Tokens
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockToken1 = await MockERC20.deploy("Mock Token 1", "MT1");
    mockToken2 = await MockERC20.deploy("Mock Token 2", "MT2");
    
    // 2. Mock Router (Minimal implementation for testing)
    const MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.deploy();
    wmntAddress = await mockRouter.WETH();

    // 3. Deploy Vault
    // Note: In real life, the address of ROUTER is hardcoded in the contract.
    // To test with a mock router, we would ideally use a factory or dependency injection.
    // However, since the ROUTER is constant in ObeliskVault.sol, we will focus on
    // testing logical paths that don't depend on the external router first, 
    // and acknowledge that integration tests would require a Mantle fork.
    const ObeliskVault = await ethers.getContractFactory("ObeliskVault");
    vault = await ObeliskVault.deploy(agent.address, [mockToken1.target, mockToken2.target]);
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

  describe("Agent Actions", function () {
    it("Should allow agent to update regime", async function () {
      await vault.connect(agent).setRegime("Volatility");
      expect(await vault.currentRegime()).to.equal("Volatility");
    });

    it("Should fail if non-agent tries to set regime", async function () {
      await expect(
        vault.connect(user1).setRegime("Volatility")
      ).to.be.revertedWith("ObeliskVault: not agent");
    });

    it("Should allow agent to toggle pause", async function () {
      await vault.connect(agent).togglePause();
      expect(await vault.vaultPaused()).to.be.true;
    });
  });

  describe("Admin Actions", function () {
    it("Should allow owner to add/remove assets", async function () {
      const newAsset = "0x0000000000000000000000000000000000000001";
      await vault.connect(owner).addAsset(newAsset);
      expect(await vault.isAssetAllowed(newAsset)).to.be.true;

      await vault.connect(owner).removeAsset(newAsset);
      expect(await vault.isAssetAllowed(newAsset)).to.be.false;
    });

    it("Should fail if non-owner tries to add asset", async function () {
      await expect(
        vault.connect(user1).addAsset(user2.address)
      ).to.be.revertedWith("ObeliskVault: not owner");
    });
  });

  describe("View Functions", function () {
    it("Should return correct withdrawable balance", async function () {
      const depositAmount = ethers.parseEther("1.0");
      await vault.connect(user1).deposit({ value: depositAmount });
      
      // Withdrawble should be deposit - 0.01 buffer
      const expected = ethers.parseEther("0.99");
      expect(await vault.getWithdrawableBalance(user1.address)).to.equal(expected);
    });
  });
});
