#!/bin/bash

# DEMO SCRIPT - Manual Testing of Service Discovery

echo "================================================"
echo "Service Discovery Demo - Manual Test Script"
echo "================================================"
echo ""
echo "This script demonstrates the service discovery"
echo "system with manual HTTP requests."
echo ""

# Check if services are running
check_service() {
    local port=$1
    local name=$2
    
    if curl -s http://localhost:$port/health > /dev/null 2>&1; then
        echo "✅ $name is running (Port $port)"
        return 0
    else
        echo "❌ $name is NOT running (Port $port)"
        return 1
    fi
}

echo "Checking services..."
echo ""
check_service 3000 "Registry" || echo "   Start: cd registry && npm start"
check_service 3001 "Service Instance 1" || echo "   Start: cd service-instance-1 && npm start"
check_service 3002 "Service Instance 2" || echo "   Start: cd service-instance-2 && npm start"

echo ""
echo "================================================"
echo "1. DISCOVER SERVICES"
echo "================================================"
echo "Fetching registered services from registry..."
echo ""
curl -s http://localhost:3000/services | jq '.'
echo ""

echo ""
echo "================================================"
echo "2. DISCOVER USER-SERVICE INSTANCES"
echo "================================================"
echo "Discovering instances of 'user-service'..."
echo ""
curl -s http://localhost:3000/discover/user-service | jq '.'
echo ""

echo ""
echo "================================================"
echo "3. CALL SERVICE INSTANCE 1"
echo "================================================"
echo "GET http://localhost:3001/users"
echo ""
curl -s http://localhost:3001/users | jq '.'
echo ""

echo ""
echo "================================================"
echo "4. CALL SERVICE INSTANCE 2"
echo "================================================"
echo "GET http://localhost:3002/users"
echo ""
curl -s http://localhost:3002/users | jq '.'
echo ""

echo ""
echo "================================================"
echo "5. HEALTH CHECK - ALL SERVICES"
echo "================================================"
echo "Registry Health:"
curl -s http://localhost:3000/health | jq '.'
echo ""
echo "Service 1 Health:"
curl -s http://localhost:3001/health | jq '.'
echo ""
echo "Service 2 Health:"
curl -s http://localhost:3002/health | jq '.'
echo ""

echo ""
echo "================================================"
echo "6. CALL SPECIFIC USER ENDPOINT"
echo "================================================"
echo "GET http://localhost:3001/users/1"
echo ""
curl -s http://localhost:3001/users/1 | jq '.'
echo ""

echo ""
echo "================================================"
echo "Demo Complete!"
echo "================================================"
echo ""
echo "Key Observations:"
echo "1. Both service instances register with the registry"
echo "2. Each instance can be discovered via the registry"
echo "3. Each service has different data per instance"
echo "4. Response includes source instance information"
echo ""
echo "Next: Run the discovery client!"
echo "cd client && npm start"
