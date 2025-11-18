#!/bin/bash
# NeuroLock Quick Start Script
# This script starts all necessary services for development

echo "🚀 NeuroLock Quick Start"
echo "======================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Function to start database
start_database() {
    echo -e "${YELLOW}📦 Starting MySQL Database...${NC}"
    cd backend/sql-dbms-bundle/sql-dbms
    docker compose up -d
    
    # Wait for MySQL to be ready
    echo "⏳ Waiting for MySQL to start..."
    sleep 5
    
    if docker compose ps | grep -q "healthy"; then
        echo -e "${GREEN}✅ MySQL Database started successfully${NC}"
        cd ../../..
        return 0
    else
        echo -e "${RED}❌ MySQL Database failed to start${NC}"
        return 1
    fi
}

# Function to start backend
start_backend() {
    echo -e "${YELLOW}🔧 Starting Backend Server...${NC}"
    cd neurolock-staff-backend
    
    if [ ! -d "node_modules" ]; then
        echo "📚 Installing dependencies..."
        npm install
    fi
    
    # Start backend in background
    npm run dev &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}"
    cd ..
    
    # Wait for backend to start
    sleep 3
    
    # Check if backend is running
    if curl -s http://localhost:4311/api/health > /dev/null; then
        echo -e "${GREEN}✅ Backend API is responding${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend API is not responding${NC}"
        kill $BACKEND_PID
        return 1
    fi
}

# Function to start frontend
start_frontend() {
    echo -e "${YELLOW}📱 Starting Frontend...${NC}"
    echo ""
    echo -e "${YELLOW}ℹ️  Update your local IP in frontend/.env${NC}"
    echo "   Find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)"
    echo ""
    
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        echo "📚 Installing dependencies..."
        npm install
    fi
    
    echo -e "${GREEN}Starting Expo...${NC}"
    echo "Press 'i' for iOS, 'a' for Android, 'w' for web"
    npm start
}

# Main menu
echo "Choose what you want to start:"
echo "1) Full Stack (Database + Backend + Frontend)"
echo "2) Database Only"
echo "3) Backend Only"
echo "4) Frontend Only"
echo "5) Backend + Frontend (Database must be running)"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        start_database && start_backend && start_frontend
        ;;
    2)
        start_database
        ;;
    3)
        start_backend
        ;;
    4)
        start_frontend
        ;;
    5)
        start_backend && start_frontend
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
