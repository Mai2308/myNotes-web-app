#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🚀 Starting myNotes Web App..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if ports are available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}❌ Port $port is already in use. Please free it or change the port in docker-compose.yml${NC}"
        return 1
    fi
    return 0
}

echo "📋 Checking ports..."
check_port 3000 || exit 1
check_port 5000 || exit 1
check_port 1433 || exit 1
echo -e "${GREEN}✅ All ports are available${NC}"

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down 2>/dev/null

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up -d --build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start services${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Services started successfully${NC}"

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."

echo "   Waiting for SQL Server..."
sleep 5
for i in {1..30}; do
    if docker exec notes-sql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P Mynoteswebapp27 -C -Q "SELECT 1" &> /dev/null; then
        echo -e "${GREEN}   ✅ SQL Server is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}   ❌ SQL Server failed to start${NC}"
        docker-compose logs sqlserver
        exit 1
    fi
    sleep 2
done

echo "   Waiting for Backend..."
for i in {1..20}; do
    if curl -s http://localhost:5000 > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Backend is ready${NC}"
        break
    fi
    if [ $i -eq 20 ]; then
        echo -e "${YELLOW}   ⚠️  Backend might not be ready yet, check logs if needed${NC}"
        break
    fi
    sleep 1
done

echo "   Waiting for Frontend..."
for i in {1..10}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Frontend is ready${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${YELLOW}   ⚠️  Frontend might not be ready yet${NC}"
        break
    fi
    sleep 1
done

echo ""
echo -e "${GREEN}🎉 myNotes Web App is now running!${NC}"
echo ""
echo "📱 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "📝 Next steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Sign up for a new account"
echo "   3. Start creating notes!"
echo ""
echo "📊 View logs:"
echo "   All services: docker-compose logs -f"
echo "   Backend only: docker-compose logs -f backend"
echo "   Frontend only: docker-compose logs -f frontend"
echo ""
echo "🛑 Stop the application:"
echo "   docker-compose down"
echo ""
