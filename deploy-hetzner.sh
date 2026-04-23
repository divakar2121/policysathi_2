#!/bin/bash
# PolicySaathi Hetzner Deployment Script
# Run this on your fresh Hetzner Ubuntu server as root
# Usage: curl -sSL https://raw.githubusercontent.com/divakar2121/policysathi_2/main/deploy-hetzner.sh | bash
# OR: wget -qO- https://raw.githubusercontent.com/divakar2121/policysathi_2/main/deploy-hetzner.sh | bash
#
# ⚙️  Configuration: Edit REPO_URL below if you use a different repository

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

# ============================================
# CONFIGURATION
# ============================================
# Default repository URL (SSH recommended — uses server's SSH key)
# Change this if you use a different repo or fork
REPO_URL="git@github.com:divakar2121/policysathi_2.git"

# Alternative: Use HTTPS (requires token or credential helper)
# REPO_URL="https://github.com/divakar2121/policysathi_2.git"

# SSH key to use for cloning (if using SSH URL)
# Leave empty to use default SSH key (~/.ssh/id_ed25519 or id_rsa)
SSH_KEY_PATH="${SSH_KEY_PATH:-~/.ssh/policysathi_hetzner}"

# App directory
APP_DIR="/opt/policysathi"
# ============================================

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

# ============================================
# SSH SETUP (Required for SSH clone)
# ============================================
if [[ "$REPO_URL" == git@* ]]; then
    echo ""
    echo "--- Configuring SSH for GitHub access ---"
    
    # Expand ~ in SSH_KEY_PATH
    SSH_KEY_PATH_EXPANDED="${SSH_KEY_PATH/#\~/$HOME}"
    
    if [ ! -f "$SSH_KEY_PATH_EXPANDED" ]; then
        echo -e "${RED}❌ SSH key not found: $SSH_KEY_PATH_EXPANDED${NC}"
        echo ""
        echo "Please upload your SSH private key to the server:"
        echo "  On your local machine:"
        echo "    scp -i ~/.ssh/policysathi_hetzner ~/.ssh/policysathi_hetzner root@YOUR_SERVER_IP:/root/.ssh/"
        echo "  Or copy the key contents manually to /root/.ssh/policysathi_hetzner"
        echo ""
        echo "Then re-run this script."
        exit 1
    fi
    
    # Set up .ssh directory
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    
    # Create symlink or copy key to default location
    if [ ! -f ~/.ssh/id_ed25519 ] && [ "$SSH_KEY_PATH_EXPANDED" != "$HOME/.ssh/id_ed25519" ]; then
        cp "$SSH_KEY_PATH_EXPANDED" ~/.ssh/id_ed25519
        chmod 600 ~/.ssh/id_ed25519
        echo -e "${GREEN}✓ SSH key configured${NC}"
    fi
    
    # Add GitHub to known_hosts (avoid interactive prompt)
    if [ ! -f ~/.ssh/known_hosts ]; then
        touch ~/.ssh/known_hosts
    fi
    if ! ssh-keygen -F github.com > /dev/null 2>&1; then
        echo "Adding GitHub to known_hosts..."
        ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts 2>/dev/null || true
        ssh-keyscan -t ed25519 github.com >> ~/.ssh/known_hosts 2>/dev/null || true
    fi
    
    # Test SSH connection (quietly)
    if ssh -T -o StrictHostKeyChecking=no git@github.com &>/dev/null; then
        echo -e "${GREEN}✓ GitHub SSH authentication working${NC}"
    else
        echo -e "${YELLOW}⚠ GitHub SSH test failed — but will try clone anyway${NC}"
    fi
fi

# ============================================
# Step 6: Clone repository (or pull if exists)
# ============================================
echo ""
echo "--- Cloning PolicySaathi repository ---"
if [ -d "$APP_DIR/.git" ]; then
    echo "Repository exists, pulling latest..."
    git pull origin main
else
    echo "Cloning from $REPO_URL ..."
    git clone "$REPO_URL" .
fi
echo -e "${GREEN}✓ Repository ready${NC}"

# Step 7: Ensure data directory exists
mkdir -p data/irdai
if [ ! -f "data/users.json" ]; then
    echo '[]' > data/users.json
    echo -e "${GREEN}✓ Created data/users.json${NC}"
fi

# Step 8: Create .env.local if not exists
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

# Step 9: Build and start Docker Compose
echo ""
echo "--- Building and starting Docker containers ---"
docker compose down 2>/dev/null || true
docker compose build
docker compose up -d

# Step 10: Wait for app to start
echo ""
echo "--- Waiting for app to start ---"
sleep 10

# Step 11: Check health
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo -e "${GREEN}✓ Application is running!${NC}"
else
    echo -e "${YELLOW}⚠ Application is starting... check logs:${NC}"
    echo "  docker compose logs -f web"
fi

# Step 12: Show summary
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Application URL: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "IMPORTANT: Edit .env.local with your API keys if not done already!"
echo "  nano $APP_DIR/.env.local"
echo ""
echo "Required environment variables:"
echo "  OPENROUTER_API_KEY      (get from https://openrouter.ai)"
echo "  NEXT_PUBLIC_SUPABASE_URL (from your Supabase project)"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  NEXTAUTH_SECRET          (generate: openssl rand -base64 32)"
echo ""
echo "After editing .env.local, restart:"
echo "  cd $APP_DIR && docker compose restart web"
echo ""
echo "Next steps:"
echo "  1. Set up Supabase: Run supabase-setup.sql in Supabase SQL Editor"
echo "  2. Open Hetzner firewall for port 3000"
echo "  3. (Optional) Configure domain & SSL"
echo ""
echo "Useful commands:"
echo "  docker compose logs -f web          # View live logs"
echo "  docker compose restart web          # Restart service"
echo "  docker compose down                 # Stop"
echo "  docker compose exec web npm run seed # Seed demo data"
echo ""
echo "--- Building and starting Docker containers ---"
docker compose down 2>/dev/null || true
docker compose build
docker compose up -d

# Step 9: Wait for app to start
echo ""
echo "--- Waiting for app to start ---"
sleep 10

# Step 10: Check health
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo -e "${GREEN}✓ Application is running!${NC}"
else
    echo -e "${YELLOW}⚠ Application is starting... check logs:${NC}"
    echo "  docker compose logs -f web"
fi

# Step 11: Show summary
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Application URL: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "IMPORTANT: Edit .env.local with your API keys!"
echo "  nano $APP_DIR/.env.local"
echo ""
echo "Required variables:"
echo "  OPENROUTER_API_KEY"
echo "  NEXT_PUBLIC_SUPABASE_URL"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  NEXTAUTH_SECRET"
echo ""
echo "Then restart: docker compose restart web"
echo ""
echo "Useful commands:"
echo "  docker compose logs -f web      # View logs"
echo "  docker compose restart web      # Restart"
echo "  docker compose down             # Stop"
echo "  docker compose exec web npm run seed   # Seed demo data"
echo ""
echo "To seed data inside Docker container:"
echo "  docker compose exec web npm run seed"
echo ""
