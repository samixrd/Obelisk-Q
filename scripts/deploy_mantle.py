import json
import os
from web3 import Web3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
RPC_URL = os.getenv("MANTLE_RPC_URL", "https://rpc.sepolia.mantle.xyz")
PRIVATE_KEY = os.getenv("AGENT_PRIVATE_KEY")
ACCOUNT_ADDRESS = os.getenv("AGENT_ADDRESS")

if not PRIVATE_KEY:
    print("Error: AGENT_PRIVATE_KEY not found in .env")
    exit(1)

# Connect to Mantle
w3 = Web3(Web3.HTTPProvider(RPC_URL))
if not w3.is_connected():
    print("Error: Could not connect to Mantle RPC")
    exit(1)

print(f"Connected to Mantle Sepolia. Block: {w3.eth.block_number}")

# Load Contract Artifacts (Assuming you compiled with Hardhat/Remix)
# PATH: contracts/artifacts/contracts/ObeliskVault.sol/ObeliskVault.json
ARTIFACT_PATH = "contracts/artifacts/contracts/ObeliskVault.sol/ObeliskVault.json"

if not os.path.exists(ARTIFACT_PATH):
    print(f"Error: Artifact not found at {ARTIFACT_PATH}")
    print("Please compile your contracts using 'npx hardhat compile' first.")
    exit(1)

with open(ARTIFACT_PATH, "r") as f:
    artifact = json.load(f)

abi = artifact["abi"]
bytecode = artifact["bytecode"]

# Create contract instance
ObeliskVault = w3.eth.contract(abi=abi, bytecode=bytecode)

# Build transaction
print("Building deployment transaction...")
construct_txn = ObeliskVault.constructor(ACCOUNT_ADDRESS).build_transaction({
    'from': ACCOUNT_ADDRESS,
    'nonce': w3.eth.get_transaction_count(ACCOUNT_ADDRESS),
    'gas': 3000000,
    'gasPrice': w3.to_wei('0.1', 'gwei') # Mantle is cheap
})

# Sign transaction
signed_txn = w3.eth.account.sign_transaction(construct_txn, private_key=PRIVATE_KEY)

# Send transaction
print("Sending transaction to Mantle...")
tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
print(f"Transaction sent! Hash: {tx_hash.hex()}")

# Wait for receipt
print("Waiting for confirmation...")
tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
print(f"Contract deployed successfully at: {tx_receipt.contractAddress}")

# Save to .env
print(f"\nUpdate your .env file with:")
print(f"VAULT_ADDRESS={tx_receipt.contractAddress}")
