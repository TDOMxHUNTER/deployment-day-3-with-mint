
#!/bin/bash

echo "🚀 Deploying Monad Profile NFT Contract..."

# Check if .env exists
if [ ! -f "contracts/.env" ]; then
    echo "❌ Please create contracts/.env file with your PRIVATE_KEY"
    echo "📝 Copy contracts/.env.example to contracts/.env and fill in your details"
    exit 1
fi

# Load environment variables
source contracts/.env

# Deploy contract
cd contracts
echo "📦 Compiling contract..."
forge build

echo "🌐 Deploying to Monad Testnet..."
forge script script/Deploy.s.sol:DeployScript --rpc-url $RPC_URL --broadcast --verify

echo "✅ Deployment complete!"
echo "🔗 Don't forget to update the CONTRACT_ADDRESS in app/utils/contractInteraction.ts"
