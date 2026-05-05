import json
import os
from web3 import Web3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
RPC_URL = os.getenv("MANTLE_RPC_URL", "https://rpc.sepolia.mantle.xyz")
PRIVATE_KEY = os.getenv("AGENT_PRIVATE_KEY")
# PLACEHOLDER: The official Mantle ERC-8004 Identity Registry Address
# Replace with the actual address from the hackathon documentation
REGISTRY_ADDRESS = os.getenv("ERC8004_REGISTRY", "0x0000000000000000000000000000000000008004") 

if not PRIVATE_KEY:
    print("Error: AGENT_PRIVATE_KEY not found in .env")
    exit(1)

# Connect to Mantle
w3 = Web3(Web3.HTTPProvider(RPC_URL))
if not w3.is_connected():
    print("Error: Could not connect to Mantle RPC")
    exit(1)

account = w3.eth.account.from_key(private_key)
print(f"Agent Identity Wallet: {account.address}")

# ERC-8004 Identity Registry Minimal ABI
ABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "string", "name": "role", "type": "string"},
            {"internalType": "string", "name": "metadataURI", "type": "string"}
        ],
        "name": "mintIdentity",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

# Create contract instance
registry = w3.eth.contract(address=REGISTRY_ADDRESS, abi=ABI)

print("Building ERC-8004 Identity Minting transaction...")

# Mint details for Obelisk Q
AGENT_NAME = "Obelisk Q"
AGENT_ROLE = "RWA Wealth Navigator"
METADATA = "ipfs://QmObeliskQ" # Placeholder IPFS link

try:
    nonce = w3.eth.get_transaction_count(account.address)
    
    # We use a try-catch for the gas estimation as the registry might not be deployed at the placeholder
    tx = registry.functions.mintIdentity(
        AGENT_NAME,
        AGENT_ROLE,
        METADATA
    ).build_transaction({
        'from': account.address,
        'nonce': nonce,
        'gas': 200000,
        'gasPrice': w3.to_wei('0.1', 'gwei')
    })

    # Sign transaction
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)

    # Send transaction
    print("Sending mint signal to Mantle...")
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    print(f"Identity Minted! Hash: {tx_hash.hex()}")
    
    print("\nObelisk Q has successfully established its ERC-8004 identity.")
    
except Exception as e:
    print(f"\nMinting failed: {e}")
    print("Ensure the ERC8004_REGISTRY address is correct in your .env")
