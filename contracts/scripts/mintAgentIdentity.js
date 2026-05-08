const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  // ERC-8004 Identity Registry on Mantle Mainnet
  const IDENTITY_REGISTRY_ADDR = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";
  
  // Your Agent's Address (the one signing the rebalance transactions)
  const agentAddress = process.env.AGENT_ADDRESS || "0x5698E89Ec2396e02679ddde33c2BA78de88F7fce";
  
  // Metadata URI (Points to your agent's manifest/capabilities)
  // TODO: Replace with your actual IPFS or hosted JSON URL
  const metadataURI = "https://raw.githubusercontent.com/samixrd/Obelisk-Q/main/agent-manifest.json";

  console.log("═══════════════════════════════════════════════");
  console.log("  ERC-8004 Agent Identity Minting — Mantle");
  console.log("═══════════════════════════════════════════════");
  console.log("Deployer:     ", deployer.address);
  console.log("Agent:        ", agentAddress);
  console.log("Registry:     ", IDENTITY_REGISTRY_ADDR);
  console.log("");

  const abi = [
    "function register(string memory agentURI) external returns (uint256)"
  ];

  const registry = await hre.ethers.getContractAt(abi, IDENTITY_REGISTRY_ADDR);

  console.log("Registering agent identity (as Agent)...");
  try {
    // The transaction MUST be sent by the agent address to bind the identity correctly
    const tx = await registry.register(metadataURI);
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ ERC-8004 Agent Identity Minted successfully!");
    console.log("Block:", receipt.blockNumber);
    
    // The ID is usually emitted in an event or returned. 
    // In many ERC-721s, it's the Transfer event.
  } catch (error) {
    console.error("❌ Registration failed:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
