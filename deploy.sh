#!/bin/bash
# Hunt-X One-Command Deployment Script
# Run this on your VPS to deploy Hunt-X

set -e

echo "🚀 Hunt-X Deployment Script"
echo "============================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ] && [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: Not in Hunt-X project directory${NC}"
    echo "Please run from: /data/.openclaw/workspace/empire/careerpilot"
    exit 1
fi

# Update code
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main

# Create uploads directories
echo -e "${YELLOW}📁 Creating upload directories...${NC}"
mkdir -p uploads/pdfs

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cat > .env << 'EOF'
# Hunt-X Environment Configuration
DATABASE_URL=sqlite:///./hunt_x.db
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
OLLAMA_API_KEY=d365b68bcede4abca98a04d557e16ab2.7QhIeOSXhFqj0SnbsBkN1Tne
OLLAMA_BASE_URL=https://ollama.com/api
CORS_ORIGINS=*
EOF
    echo -e "${GREEN}✓ Created .env file${NC}"
fi

# Check if Docker is available
if command -v docker >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker found${NC}"
    echo -e "${YELLOW}🔨 Building with Docker...${NC}"
    
    if [ -f "docker-compose.prod.yml" ]; then
        docker compose -f docker-compose.prod.yml down 2>/dev/null || true
        docker compose -f docker-compose.prod.yml up -d --build
    else
        docker compose down 2>/dev/null || true
        docker compose up -d --build
    fi
    
    echo -e "${GREEN}✓ Deployed with Docker!${NC}"
    echo ""
    echo "Backend: http://$(hostname -I | awk '{print $1}'):8000"
    echo "Frontend: http://$(hostname -I | awk '{print $1}'):3000"
    
elif command -v python3 >/dev/null 2>&1; then
    echo -e "${YELLOW}🐍 Docker not found, using Python...${NC}"
    
    # Check if venv module is available
    if python3 -m venv --help >/dev/null 2>&1; then
        echo -e "${YELLOW}🔧 Setting up Python environment...${NC}"
        
        cd backend
        
        # Create venv if it doesn't exist
        if [ ! -d "venv" ]; then
            python3 -m venv venv
        fi
        
        # Activate and install
        source venv/bin/activate
        pip install --upgrade pip
        pip install -r requirements.txt
        
        echo -e "${GREEN}✓ Python dependencies installed${NC}"
        
        # Kill existing process if running
        pkill -f "uvicorn.*8000" 2>/dev/null || true
        sleep 2
        
        # Start backend in background
        echo -e "${YELLOW}🚀 Starting backend server...${NC}"
        nohup python -m uvicorn main:app --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
        
        cd ..
        
        echo -e "${GREEN}✓ Backend started on port 8000${NC}"
        echo "Log file: backend.log"
        
        # Check if npm is available for frontend
        if command -v npm >/dev/null 2>&1; then
            echo -e "${YELLOW}📦 Building frontend...${NC}"
            cd frontend
            npm install
            npm run build
            cd ..
            echo -e "${GREEN}✓ Frontend built${NC}"
            echo "Frontend files in: frontend/dist/"
        else
            echo -e "${YELLOW}⚠️  npm not found, skipping frontend build${NC}"
        fi
        
    else
        echo -e "${RED}❌ Python venv module not available${NC}"
        echo "Install it with: sudo apt install python3-venv"
        exit 1
    fi
else
    echo -e "${RED}❌ Neither Docker nor Python found${NC}"
    echo "Please install Docker or Python 3"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Hunt-X deployment complete!${NC}"
echo ""
echo "API Health Check:"
sleep 3
curl -s http://localhost:8000/api/health || echo "Backend not responding yet (may need more time)"
echo ""
echo "📊 To check status:"
echo "  Docker: docker ps"
echo "  Python: ps aux | grep uvicorn"
echo ""
echo "📝 View logs:"
echo "  Docker: docker logs hunt-x-backend-1"
echo "  Python: tail -f backend.log"
