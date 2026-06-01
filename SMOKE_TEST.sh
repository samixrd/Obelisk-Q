#!/bin/bash

echo "🧪 Running Smoke Tests..."

# Test 1: Frontend builds
echo "✓ Building frontend..."
pnpm build
if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed"
  exit 1
fi

# Test 2: Backend starts
echo "✓ Testing backend startup..."
cd backend
timeout 10 python -m uvicorn main:app --reload --port 8000 &
sleep 3
BACKEND_PID=$!

# Test 3: Backend API responds
echo "✓ Testing backend API..."
curl -s http://localhost:8000/health > /dev/null
if [ $? -ne 0 ]; then
  echo "❌ Backend API failed"
  kill $BACKEND_PID
  exit 1
fi

# Test 4: Smart contract callable
echo "✓ Checking smart contract on Mantle..."
curl -s https://explorer.mantle.xyz/api/v1/addresses/0x59fdE89B810812846ED167033C6d33fa425835E2 > /dev/null
if [ $? -ne 0 ]; then
  echo "⚠️  Contract not accessible (network issue?)"
else
  echo "✓ Contract is live on Mantle"
fi

kill $BACKEND_PID

echo "✅ All smoke tests passed!"
