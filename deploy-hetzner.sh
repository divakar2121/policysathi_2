#!/bin/bash
# PolicySaathi Hetzner Deployment Script
# Run this on your fresh Hetzner Ubuntu server as root
# Usage: curl -sSL https://raw.githubusercontent.com/divakar2121/policysathi_2/main/deploy-hetzner.sh | bash
# OR: wget -qO- https://raw.githubusercontent.com/divakar2121/policysathi_2/main/deploy-hetzner.sh | bash

set -e  # Exit on error

echo "=========================================="
echo "PolicySaathi - Hetzner Deployment Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if running as root
if [ "$EUID" -ne 0 ]; then
   echo -e "${RED}❌ Please run as root (use sudo)${NC}"
   exit 1
fi

echo -e "${GREEN}✓ Running as root${NC}"

# Step 2: Update system
echo ""
echo "--- Updating system packages ---"
apt update && apt upgrade -y

# Step 3: Install Docker
echo ""
echo "--- Installing Docker ---"
if ! command -v docker &> /dev/null; then
    apt install -y docker.io
    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${YELLOW}⚠ Docker already installed${NC}"
fi

# Step 4: Install Docker Compose plugin
echo ""
echo "--- Installing Docker Compose plugin ---"
if ! docker compose version &> /dev/null; then
    apt install -y docker-compose-plugin
    echo -e "${GREEN}✓ Docker Compose plugin installed${NC}"
else
    echo -e "${YELLOW}⚠ Docker Compose already installed${NC}"
fi

# Step 5: Create app directory
APP_DIR="/opt/policysathi"
echo ""
echo "--- Creating app directory: $APP_DIR ---"
mkdir -p $APP_DIR
cd $APP_DIR

# Step 6: Clone repository (or pull if exists)
echo ""
echo "--- Cloning PolicySaathi repository ---"
if [ -d "$APP_DIR/.git" ]; then
    echo "Repository exists, pulling latest..."
    git pull origin main
else
    git clone https://github.com/divakar2121/policysathi_2.git .
fi
echo -e "${GREEN}✓ Repository ready${NC}"

# Step 7: Install dependencies
echo ""
echo "--- Installing dependencies ---"
npm ci --only=production || npm install --production
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 8: Build app
echo ""
echo "--- Building application ---"
npm run build
echo -e "${GREEN}✓ Build complete${NC}"

# Step 9: Create .env.local if not exists
echo ""
echo "--- Setting up environment ---"
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${YELLOW}⚠ .env.local created from template${NC}"
    echo -e "${YELLOW}⚠ Please edit .env.local and add your API keys!${NC}"
    echo ""
    echo "Required variables:"
    echo "  OPENROUTER_API_KEY"
    echo "  NEXT_PUBLIC_SUPABASE_URL"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  NEXTAUTH_SECRET"
else
    echo -e "${YELLOW}⚠ .env.local already exists (skipping)${NC}"
fi

# Step 10: Ensure data directory exists
mkdir -p data/irdai
if [ ! -f "data/users.json" ]; then
    echo '[]' > data/users.json
    echo -e "${GREEN}✓ Created data/users.json${NC}"
fi

# Step 11: Start with Docker Compose
echo ""
echo "--- Starting Docker Compose ---"
docker compose down 2>/dev/null || true
docker compose build
docker compose up -d

# Step 12: Wait for app to start
echo ""
echo "--- Waiting for app to start ---"
sleep 10

# Step 13: Check health
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo -e "${GREEN}✓ Application is running!${NC}"
else
    echo -e "${YELLOW}⚠ Application is starting... check logs:${NC}"
    echo "  docker compose logs -f web"
fi

# Step 14: Show summary
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Application URL: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your API keys"
echo "2. Set up Supabase: run supabase-setup.sql in Supabase SQL Editor"
echo "3. Open firewall for port 3000"
echo "4. (Optional) Configure domain & SSL"
echo ""
echo "Useful commands:"
echo "  docker compose logs -f web      # View logs"
echo "  docker compose restart web      # Restart"
echo "  docker compose down             # Stop"
echo "  npm run seed                    # Seed demo data (inside container)"
echo ""
echo "To seed data inside Docker container:"
echo "  docker compose exec web npm run seed"
echo ""
