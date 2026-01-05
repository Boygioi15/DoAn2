#!/bin/bash

# Script tự động setup domain silkshop.online trên EC2
# Usage: ./setup-silkshop.sh

set -e

DOMAIN="silkshop.online"
EC2_IP="52.63.110.114"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== Setting up domain: ${DOMAIN} ===${NC}"
echo -e "${BLUE}EC2 IP: ${EC2_IP}${NC}"
echo ""

# Step 1: Install Nginx
echo -e "${YELLOW}Step 1: Installing Nginx...${NC}"
sudo apt update
sudo apt install nginx -y

# Step 2: Create Nginx config
echo -e "${YELLOW}Step 2: Creating Nginx configuration...${NC}"
sudo tee /etc/nginx/sites-available/silkshop > /dev/null <<'EOF'
# Upstream for backend API
upstream backend {
    server localhost:3000;
}

# Upstream for frontend admin
upstream frontend-admin {
    server localhost:5173;
}

# Upstream for frontend client
upstream frontend-client {
    server localhost:5174;
}

# Main server - silkshop.online (single domain with path routing)
server {
    listen 80;
    server_name silkshop.online www.silkshop.online;

    # Backend API - /api/*
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        rewrite ^/api/?(.*) /$1 break;
    }

    # Admin Panel - /admin/*
    location /admin {
        proxy_pass http://frontend-admin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend Client - root and all other paths
    location / {
        proxy_pass http://frontend-client;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Step 3: Enable site
echo -e "${YELLOW}Step 3: Enabling site...${NC}"
sudo ln -sf /etc/nginx/sites-available/silkshop /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Step 4: Test and restart Nginx
echo -e "${YELLOW}Step 4: Testing Nginx configuration...${NC}"
sudo nginx -t

if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    echo -e "${GREEN}Nginx configured successfully!${NC}"
else
    echo -e "${YELLOW}Nginx configuration has errors. Please check manually.${NC}"
    exit 1
fi

# Step 5: Install Certbot
echo -e "${YELLOW}Step 5: Installing Certbot for SSL...${NC}"
sudo apt install certbot python3-certbot-nginx -y

echo ""
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo ""
echo -e "${BLUE}=== Next Steps ===${NC}"
echo ""
echo -e "${YELLOW}1. Configure DNS records (on your domain provider):${NC}"
echo -e "   Type: A"
echo -e "   Name: @"
echo -e "   Value: ${EC2_IP}"
echo -e ""
echo -e "   Type: A"
echo -e "   Name: www"
echo -e "   Value: ${EC2_IP}"
echo ""
echo -e "${YELLOW}2. Wait for DNS to propagate (5-30 minutes)${NC}"
echo -e "   Check with: nslookup silkshop.online"
echo ""
echo -e "${YELLOW}3. Setup SSL certificate:${NC}"
echo -e "   ${GREEN}sudo certbot --nginx -d silkshop.online -d www.silkshop.online${NC}"
echo ""
echo -e "${BLUE}Your services will be available at:${NC}"
echo -e "  Frontend: http://silkshop.online (→ port 5174)"
echo -e "  Admin: http://silkshop.online/admin (→ port 5173)"
echo -e "  API: http://silkshop.online/api (→ port 3000)"
echo ""
echo -e "${BLUE}After SSL setup:${NC}"
echo -e "  Frontend: https://silkshop.online"
echo -e "  Admin: https://silkshop.online/admin"
echo -e "  API: https://silkshop.online/api"

