# Hunt-X VPS Deployment Guide

## Pre-Deployment Checklist

Your VPS needs:
- [ ] Docker OR Python 3.11+ with venv
- [ ] Git
- [ ] Ports 8000 (backend), 3000 (frontend) open

## Option 1: Docker Deployment (Recommended)

```bash
# SSH to your VPS
ssh tanvir@168.231.124.93

# Navigate to project
cd /data/.openclaw/workspace/empire/careerpilot

# Pull latest
git pull

# Create environment file
cat > .env << 'EOF'
DATABASE_URL=sqlite:///./hunt_x.db
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
OLLAMA_API_KEY=d365b68bcede4abca98a04d557e16ab2.7QhIeOSXhFqj0SnbsBkN1Tne
OLLAMA_BASE_URL=https://ollama.com/api
EOF

# Deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f backend
```

## Option 2: Python Direct Deployment

```bash
# Install dependencies
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm

# Backend
cd /data/.openclaw/workspace/empire/careerpilot/backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create startup script
cat > start_backend.sh << 'EOF'
#!/bin/bash
cd /data/.openclaw/workspace/empire/careerpilot/backend
source venv/bin/activate
python main.py
EOF
chmod +x start_backend.sh

# Frontend
cd /data/.openclaw/workspace/empire/careerpilot/frontend
npm install
npm run build

# Start with PM2 or systemd
```

## Post-Deployment Verification

```bash
# Check backend
curl http://localhost:8000/api/health

# Check frontend (if using nginx or direct)
curl http://localhost:3000
```

## URLs After Deploy

- **Backend API**: http://168.231.124.93:8000
- **Frontend**: http://168.231.124.93:3000
- **API Docs**: http://168.231.124.93:8000/docs

## Troubleshooting

### Port Already in Use
```bash
sudo lsof -i :8000
sudo kill -9 <PID>
```

### Permission Issues
```bash
sudo chown -R tanvir:tanvir /data/.openclaw/workspace/empire/careerpilot
```

### Database Issues
```bash
# SQLite (default)
rm -f /data/.openclaw/workspace/empire/careerpilot/backend/hunt_x.db
# Restart
```

## Auto-Start on Boot

Create systemd service:

```bash
sudo tee /etc/systemd/system/hunt-x.service << 'EOF'
[Unit]
Description=Hunt-X Backend
After=network.target

[Service]
Type=simple
User=tanvir
WorkingDirectory=/data/.openclaw/workspace/empire/careerpilot/backend
Environment="DATABASE_URL=sqlite:///./hunt_x.db"
Environment="OLLAMA_API_KEY=d365b68bcede4abca98a04d557e16ab2.7QhIeOSXhFqj0SnbsBkN1Tne"
Environment="OLLAMA_BASE_URL=https://ollama.com/api"
ExecStart=/data/.openclaw/workspace/empire/careerpilot/backend/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable hunt-x
sudo systemctl start hunt-x
```
