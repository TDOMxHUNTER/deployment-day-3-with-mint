
# Monad Profile NFT Deployment Instructions

## Prerequisites

1. **Monad Testnet Wallet Setup**:
   - Add Monad Testnet to MetaMask:
     - Network Name: Monad Testnet
     - RPC URL: https://testnet1.monad.xyz
     - Chain ID: 41454
     - Currency Symbol: ETH
     - Block Explorer: https://testnet1.monad.xyz

2. **Get Testnet ETH**:
   - Visit the Monad testnet faucet
   - Request testnet ETH for deployment and testing

## Deployment Steps

1. **Setup Environment**:
   ```bash
   cd contracts
   cp .env.example .env
   ```

2. **Configure .env file**:
   ```
   PRIVATE_KEY=your_wallet_private_key_here
   RPC_URL=https://testnet1.monad.xyz
   ```

3. **Deploy Contract**:
   ```bash
   ./deploy-contract.sh
   ```

4. **Update Frontend**:
   - Copy the deployed contract address from the deployment output
   - Update `CONTRACT_ADDRESS` in `app/utils/contractInteraction.ts`

5. **Test the Application**:
   - Connect your wallet to the app
   - Try minting a profile NFT
   - Verify the transaction on the Monad testnet explorer

## Features

- ✅ ERC-721 NFT contract for profile cards
- ✅ Mint price: 0.01 ETH
- ✅ Unique handle verification
- ✅ Profile metadata storage
- ✅ Withdrawal functionality for contract owner
- ✅ Real-time transaction tracking
- ✅ User token count display

## Contract Functions

- `mintProfile()`: Mint a new profile NFT
- `getUserTokens()`: Get all NFTs owned by a user
- `getProfileData()`: Get profile data for a token
- `isHandleAvailable()`: Check if a handle is available
- `totalSupply()`: Get total minted NFTs

## Next Steps

After successful deployment, you can:
1. Add IPFS integration for decentralized metadata storage
2. Implement profile card image generation
3. Add more profile customization options
4. Create a marketplace for trading profile NFTs
