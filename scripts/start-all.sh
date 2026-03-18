#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Starting Microservice Discovery Demo${NC}"
echo -e "${BLUE}================================================${NC}"

# Create a temporary directory for log files
LOG_DIR="$PROJECT_ROOT/.logs"
mkdir -p "$LOG_DIR"

# Function to handle Ctrl+C
cleanup() {
    echo -e "\n${BLUE}Shutting down all services...${NC}"
    
    # Kill all background processes
    jobs -p | xargs -r kill 2>/dev/null
    
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set trap for Ctrl+C
trap cleanup SIGINT SIGTERM

echo ""
echo -e "${GREEN}1️⃣  Starting Service Registry (Port 3000)...${NC}"
(cd "$PROJECT_ROOT/registry" && npm start > "$LOG_DIR/registry.log" 2>&1) &
REGISTRY_PID=$!
sleep 2

echo -e "${GREEN}2️⃣  Starting Service Instance 1 (Port 3001)...${NC}"
(cd "$PROJECT_ROOT/service-instance-1" && npm start > "$LOG_DIR/service-1.log" 2>&1) &
SERVICE1_PID=$!
sleep 2

echo -e "${GREEN}3️⃣  Starting Service Instance 2 (Port 3002)...${NC}"
(cd "$PROJECT_ROOT/service-instance-2" && npm start > "$LOG_DIR/service-2.log" 2>&1) &
SERVICE2_PID=$!
sleep 2

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✅ All services started!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "Registry:         http://localhost:3000"
echo "Service Instance 1: http://localhost:3001"
echo "Service Instance 2: http://localhost:3002"
echo ""
echo "Log files:"
echo "  - $LOG_DIR/registry.log"
echo "  - $LOG_DIR/service-1.log"
echo "  - $LOG_DIR/service-2.log"
echo ""
echo -e "${BLUE}Starting Discovery Client Demo...${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Run the client demo
(cd "$PROJECT_ROOT/client" && npm start)

# Wait for background processes
wait
