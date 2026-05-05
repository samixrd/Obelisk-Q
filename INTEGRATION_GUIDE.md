/**
 * Obelisk Q — Deployment & Integration Guide
 * Follow these steps to "Make it Real".
 */

# 1. Start the AI Engine (Python Backend)
The AI Engine handles Q-Score, Market Regimes, and Performance calculations.

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
*Backend will run at http://localhost:8000*

# 2. Start the Frontend (Vite)
Ensure your `.env.local` has the correct `VITE_SCORING_API_URL`.

```bash
# In the root directory
npm install
npm run dev
```

# 3. Deploy the Smart Contract (Mantle Network)
If you haven't deployed the `ObeliskVault.sol` yet, use a tool like Remix or Hardhat with the following parameters:

- **Contract**: `ObeliskVault.sol`
- **Network**: Mantle Sepolia (Chain ID: 5003)
- **Constructor Argument**: Your Agent/Owner address.

Update `VITE_VAULT_ADDRESS` in `.env.local` after deployment.

# 4. Verification
- **Purple Cards**: Now fetch live data from the Mantle blockchain.
- **Yellow Cards**: Now fetch live data from the FastAPI backend.
- **Activity Feed**: Real-time logs are now pushed from the AI Engine.
