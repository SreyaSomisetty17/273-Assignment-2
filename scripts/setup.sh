#!/bin/bash

echo "================================================"
echo "Installing dependencies for all components..."
echo "================================================"

# Registry
echo ""
echo "📦 Installing registry dependencies..."
cd registry
npm install
cd ..

# Service Instance 1
echo ""
echo "📦 Installing service-instance-1 dependencies..."
cd service-instance-1
npm install
cd ..

# Service Instance 2
echo ""
echo "📦 Installing service-instance-2 dependencies..."
cd service-instance-2
npm install
cd ..

# Client
echo ""
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

echo ""
echo "✅ All dependencies installed successfully!"
echo ""
echo "Next, run: ./scripts/start-all.sh"
