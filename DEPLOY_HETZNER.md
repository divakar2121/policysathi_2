# Deploying PolicySaathi on Hetzner

This guide covers deploying PolicySaathi to a Hetzner Cloud VPS using Docker.

---

## Prerequisites

1. **Hetzner Cloud Account** — https://console.hetzner.cloud
2. **Hetzner SSH Key** — Already identified as `~/.ssh/policysathi_hetzner`
3. **Domain** (optional) — For production HTTPS
4. **GitHub Repository** — `policysathi_2` already pushed

---

## Step 1: Create Hetzner Server

### Option A: Via web.console.hetzner.cloud (Recommended)

1. Log into [Hetzner Cloud Console](https://console.hetzner.cloud)
2. Click **"Add Server"**
3. **Select location**: e.g., `Falkenstein` (Germany) or `Nuremberg`
4. **Image**: Ubuntu 24.04 (or 22.04 LTS)
5. **Type**: `cx11` (1 vCPU, 2 GB RAM, 40 GB SSD) — ~€5/month
   - For production with traffic: `cx21` (€8/month) or `cx31` (€12/month)
6. **SSH Keys**: Select your `policysathi_hetzner` key (or add it)
7. **Name**: `policysathi-server` (or your choice)
8. Click **"Create & Buy Now"**

Wait 30-60 seconds for server to be ready.

### Option B: Via Hetzner CLI (`hcloud`)

```bash
# Install hcloud CLI
curl -sSL https://api.hetzner.cloud/v1/cli/install.sh | bash

# Create server
hcloud server create \
  --name policysathi \
  --image ubuntu-24.04 \
  --type cx11 \
  --ssh-key policysathi_hetzner \
  --location fsn1
```

---

## Step 2: Get Server Details

After server creation, note:

- **Public IPv4**: e.g., `135.181.123.45`
- **SSH User**: `root` (Ubuntu) or your configured user

From Hetzner Console:
1. Go to **"Servers"** → click your server
2. Copy **IP Address**

---

## Step 3: Prepare Server (One-Time Setup)

Connect via SSH:

```bash
# Connect as root
ssh -i ~/.ssh/policysathi_hetzner root@YOUR_SERVER_IP

# OR if using your existing key (already in agent):
ssh root@YOUR_SERVER_IP
```

Once connected:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
apt install -y docker.io

# Install Docker Compose (plugin method)
apt install -y docker-compose-plugin

# Start & enable Docker
systemctl start docker
systemctl enable docker

# Add current user to docker group (optional, for sudo-less docker)
usermod -aG docker $USER
# Note: Log out and back in for group change to apply

# Verify installation
docker --version
docker compose version

# Create app directory
mkdir -p /opt/policysathi
cd /opt/policysathi
```

---

## Step 4: Clone Repository on Server

```bash
# Clone from GitHub (using HTTPS with credential helper)
git clone https://github.com/divakar2121/policysathi_2.git .

# OR use SSH (requires SSH key on GitHub)
# git clone git@github.com:divakar2121/policysathi_2.git .

# Install dependencies
npm install --production

# Build for production
npm run build
```

---

## Step 5: Configure Environment Variables

On the server:

```bash
nano .env.local
```

Paste your environment variables:

```env
# REQUIRED
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXTAUTH_SECRET=your-generated-secret-here

# OPTIONAL (set proper URL for production)
NEXT_PUBLIC_APP_URL=http://YOUR_SERVER_IP:3000
# or if using domain:
# NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**⚠️ Important**: 
- `NEXTAUTH_SECRET` must be at least 32 characters. Generate: `openssl rand -base64 32`
- If you don't set Google OAuth, leave `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` empty (email/password login still works)

---

## Step 6: Set Up Supabase Database

1. Go to https://supabase.com → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy contents of `supabase-setup.sql` from your local repo
5. Paste into SQL editor
6. Click **Run** (or press Ctrl+Enter)

You should see: "Success. No rows returned" — tables are created.

---

## Step 7: Start Application with Docker Compose

```bash
# Build and start
docker compose up -d

# Check logs
docker compose logs -f web

# Stop
docker compose down

# Restart
docker compose restart
```

**Expected output:**
```
Creating policysathi_web_1 ... done
```

Wait 10 seconds, then test:

```bash
curl http://localhost:3000
# Should return HTML (or check from your local machine: curl YOUR_SERVER_IP:3000)
```

---

## Step 8: Configure Firewall (Hetzner)

From Hetzner Console:

1. Go to **"Servers"** → select your server
2. Click **"Firewall"** tab (or create a new firewall)
3. Create new firewall or edit existing:
   - **Name**: `policysathi-firewall`
   - **Rules**:
     - Allow SSH (port 22) — from your IP only (for security)
     - Allow HTTP (port 3000) — from anywhere (0.0.0.0/0)
     - (Optional) Allow HTTPS (port 443) if using SSL
4. Attach firewall to your server
5. **Apply**

**OR via CLI:**

```bash
# Create firewall
hcloud firewall create --name policysathi

# Add rules
hcloud firewall add-rule policysathi --direction in --port 22 --source-ip YOUR_IP/32 --action allow
hcloud firewall add-rule policysathi --direction in --port 3000 --source-ip 0.0.0.0/0 --action allow

# Attach to server
hcloud firewall apply-to-resource policysathi --resource-type server --resource-id YOUR_SERVER_ID
```

---

## Step 9: Access Your App

**Via IP** (temporary):
```
http://YOUR_SERVER_IP:3000
```

**Via Domain** (recommended for production):

1. Buy domain (if needed) — Namecheap, GoDaddy, etc.
2. Point A record to your server IP:
   ```
   Type: A
   Name: @ (or your subdomain like app.)
   Value: YOUR_SERVER_IP
   TTL: 3600
   ```
3. Wait for DNS propagation (5-30 mins)
4. Update `.env.local` on server:
   ```env
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```
5. Restart: `docker compose restart web`

6. (Optional) Add SSL with Caddy or Nginx reverse proxy:

**Using Caddy (easiest):**
```bash
# Install Caddy
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/deb.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy

# Configure Caddy
nano /etc/caddy/Caddyfile
```

Caddyfile:
```
yourdomain.com {
    reverse_proxy localhost:3000
}
```

```bash
# Start Caddy
systemctl start caddy
systemctl enable caddy
```

---

## Step 10: Set Up Auto-Update (Optional but Recommended)

Create a webhook to auto-deploy on GitHub pushes:

**Option A: GitHub Actions (Already in repo)**

The `.github/workflows/deploy.yml` is already configured! Just add **secrets**:

1. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these repository secrets:

| Name | Value |
|------|-------|
| `SERVER_HOST` | Your server IP (e.g., `135.181.123.45`) |
| `SERVER_USER` | `root` |
| `SSH_KEY` | Contents of `~/.ssh/policysathi_hetzner` private key |
| `SSH_PORT` | `22` (optional, default 22) |

3. Push to `main` branch → GitHub Actions will auto-deploy!

**Option B: Manual webhook listener**

On server, create a webhook listener:

```bash
# Install webhook
apt install -y webhook

# Create hook config
nano /etc/webhook/hooks.json
```

hooks.json:
```json
{
  "hooks": [
    {
      "id": "policysathi-deploy",
      "execute-command": "/opt/policysathi/deploy.sh",
      "command-working-directory": "/opt/policysathi"
    }
  ]
}
```

deploy.sh:
```bash
#!/bin/bash
cd /opt/policysathi
git pull origin main
docker compose down
docker compose build
docker compose up -d
docker system prune -f
```

```bash
chmod +x /opt/policysathi/deploy.sh
webhook -hooks /etc/webhook/hooks.json -port 9000 -verbose

# Configure firewall to allow port 9000 from GitHub webhook IPs
# GitHub webhook IPs: https://api.github.com/meta
```

Then configure GitHub webhook:
- Repo → Settings → Webhooks → Add webhook
- Payload URL: `http://YOUR_IP:9000/hook/policysathi-deploy`
- Content type: `application/json`
- Secret: (optional, set in both GitHub & webhook config)

---

## Step 11: Monitoring & Logs

```bash
# View logs
docker compose logs -f web

# View logs with timestamps
docker compose logs -f --tail 100 web

# Check container status
docker compose ps

# Check resource usage
docker stats

# View Docker system info
docker system df

# Restart only if needed
docker compose restart web

# Stop
docker compose stop

# Full cleanup (WARNING: removes data)
docker compose down -v
```

---

## Step 12: Backup Strategy

### Backup Supabase (Cloud)
Supabase handles backups automatically. Pro plan gets daily backups.

### Backup Local Data
If you're storing `data/` locally (users.json, IRDAI DB):

```bash
# Automated backup script (backup.sh)
#!/bin/bash
BACKUP_DIR=/backup
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf $BACKUP_DIR/policysathi_$DATE.tar.gz /opt/policysathi/data
# Upload to S3, Google Drive, or Hetzner Storage Box
```

Add to crontab:
```bash
crontab -e
# Daily backup at 2 AM
0 2 * * * /opt/policysathi/backup.sh
```

### Backup Docker volumes (if using them)
```bash
docker run --rm -v policysathi_data:/data -v /backup:/backup alpine \
  tar czf /backup/policysathi_data.tar.gz -C /data .
```

---

## Step 13: Monitoring & Alerts (Optional)

### Use Hetzner Cloud Console
- Server metrics (CPU, RAM, Disk) visible in Hetzner dashboard
- Set up alerts (50% CPU, 80% RAM)

### Use Docker health checks
Already in `docker-compose.yml`:
```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/auth"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

Check health:
```bash
docker inspect --format='{{.State.Health.Status}}' policysathi_web_1
```

---

## Step 14: SSL/HTTPS (Production Required)

### Option A: Caddy (Zero-config, free SSL)
```bash
# Install Caddy
apt update
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/deb.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy

# Configure
nano /etc/caddy/Caddyfile
```

Caddyfile:
```
yourdomain.com {
    reverse_proxy localhost:3000
    encode gzip
}
```

```bash
# Start
systemctl start caddy
systemctl enable caddy

# Check status
systemctl status caddy
```

Caddy auto-requests Let's Encrypt SSL certificates.

### Option B: Nginx + Certbot
```bash
apt install -y nginx certbot python3-certbot-nginx

# Configure Nginx
nano /etc/nginx/sites-available/policysathi
```

Nginx config:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/policysathi /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com
```

---

## Step 15: Post-Deployment Checklist

- [ ] App accessible at `http://YOUR_IP:3000`
- [ ] Can register/login
- [ ] `/api/chat` returns AI responses
- [ ] `/api/verify` returns IRDAI stats
- [ ] Supabase data persists (check tables)
- [ ] Firewall only allows necessary ports (22, 3000, 80, 443)
- [ ] `.env.local` has all required keys
- [ ] Docker compose `ps` shows `web` container `Up`
- [ ] Health check passes: `curl http://localhost:3000/api/auth`
- [ ] SSL certificate active (if using domain)

---

## Troubleshooting

### Container fails to start
```bash
docker compose logs web  # Check error logs
docker compose ps  # Check status
docker compose down && docker compose up -d  # Restart
```

### "Address already in use" (port 3000)
```bash
# Check what's using port 3000
ss -tlnp | grep 3000
# Kill process or change port in docker-compose.yml
```

### Out of memory (OOM kill)
```bash
# Check memory usage
free -h
# Increase swap or upgrade server type (cx11 → cx21)
```

### Database connection errors
- Check Supabase URL and anon key in `.env.local`
- Verify Supabase project is active (not paused)
- Check Supabase connection limits

### "Module not found" errors
```bash
# Rebuild with fresh dependencies
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Can't access from outside
- Check Hetzner firewall rules (port 3000 open to 0.0.0.0/0)
- Check server OS firewall: `ufw status` (disable or allow 3000)
- Verify server IP correct

---

## Cost Optimization (Hetzner)

- **cx11** (€5/month) — sufficient for 10-50 users
- **cx21** (€8/month) — for 50-200 users
- **cx31** (€12/month) — for 200-500 users

**You pay only for compute** — bandwidth is free (unmetered) on most Hetzner plans.

Add **Snapshots** (€0.02/GB/month) for backups.

---

## Deploy with GitHub Actions (Zero Touch)

After adding secrets to GitHub repo:

1. Push to `main` branch
2. GitHub Actions runs automatically:
   - Builds Docker image
   - SSHes to Hetzner server
   - Pulls latest code
   - Rebuilds & restarts containers

Watch progress: **GitHub repo → Actions tab**

---

## Rollback

If deployment fails:

```bash
# On server
docker compose down
docker compose up -d  # Reverts to last working image

# Or if you kept previous images:
docker images  # Find previous image ID
docker tag PREVIOUS_IMAGE_ID policysathi:rollback
docker compose up -d
```

---

## Useful Commands

```bash
# Server health
uptime
df -h
free -h

# Docker stats
docker stats

# View all docker logs
docker compose logs --tail=100

# Exec into container
docker compose exec web bash

# Clean up unused images
docker image prune -a

# Update base image
docker compose pull  # if using FROM image:tag
docker compose up -d --build
```

---

## Support

- **Hetzner Docs**: https://docs.hetzner.com/
- **Docker Docs**: https://docs.docker.com/
- **PolicySaathi Issues**: https://github.com/divakar2121/policysathi_2/issues

---

**Deployed!** Your PolicySaathi is now running on Hetzner Cloud at `http://YOUR_IP:3000`
