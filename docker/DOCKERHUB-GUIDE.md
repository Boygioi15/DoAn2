# Docker Hub Deployment Guide

Simple guide for deploying to Docker Hub (easier than AWS ECR).

## Prerequisites

- Docker installed on your local machine
- Docker Hub account (free at https://hub.docker.com)
- Docker and Docker Compose installed on your server/EC2

## Quick Start

### Step 1: Build and Push from Local Machine

```bash
cd docker

# One command to build and push (you'll be prompted to login to Docker Hub)
./deploy-dockerhub.sh YOUR_DOCKERHUB_USERNAME latest
```

That's it! Your images are now on Docker Hub.

### Step 2: Deploy on EC2/Server

```bash
# SSH into your server
ssh ec2-user@YOUR_SERVER_IP

# Copy the deployment files (if not already there)
# Or clone your repo on the server

cd docker

# Make script executable
chmod +x ec2-deploy-dockerhub.sh

# Deploy (login to Docker Hub when prompted)
./ec2-deploy-dockerhub.sh YOUR_DOCKERHUB_USERNAME latest
```

## Detailed Steps

### Build and Push Images

#### Option 1: Use the automated script (Recommended)
```bash
./deploy-dockerhub.sh yourusername latest
```

#### Option 2: Manual steps
```bash
# 1. Login to Docker Hub
docker login

# 2. Build and tag images
./build-images.sh docker.io/yourusername latest

# 3. Push images
./push-images.sh docker.io/yourusername latest
```

### Deploy on Server

#### Option 1: Use the automated script (Recommended)
```bash
./ec2-deploy-dockerhub.sh yourusername latest
```

#### Option 2: Manual steps
```bash
# 1. Login to Docker Hub
docker login

# 2. Pull images
docker pull docker.io/hoangquy18/backend:latest
docker pull docker.io/hoangquy18/frontend-admin:latest
docker pull docker.io/hoangquy18/frontend-client:latest

# 3. Deploy
REGISTRY=docker.io/hoangquy18 TAG=latest docker compose -f docker-compose.prod.yml up -d
```

## Updating Deployment

When you make code changes:

```bash
# On local machine
cd docker
./deploy-dockerhub.sh yourusername latest

# On server
cd docker
./ec2-deploy-dockerhub.sh yourusername latest
```

## View Your Images on Docker Hub

Visit: https://hub.docker.com/u/YOUR_USERNAME/repositories

You should see:
- `yourusername/backend`
- `yourusername/frontend-admin`
- `yourusername/frontend-client`

## Making Images Public vs Private

### Public (Free, unlimited)
- Images are visible to everyone
- Anyone can pull your images
- No authentication needed to pull
- Best for open source projects

### Private (Free tier: 1 private repo)
- Images are only visible to you
- Requires authentication to pull
- Better for production applications
- Upgrade to paid plan for more private repos

To change visibility:
1. Go to https://hub.docker.com
2. Click on your repository
3. Go to Settings → Make public/private

## Troubleshooting

### Login Issues
```bash
# If login fails, try:
docker logout
docker login

# Enter your Docker Hub username and password
```

### Permission Denied
```bash
# Make scripts executable
chmod +x deploy-dockerhub.sh
chmod +x ec2-deploy-dockerhub.sh
chmod +x build-images.sh
chmod +x push-images.sh
```

### Images Not Found
```bash
# Verify images exist on Docker Hub
docker search yourusername/backend

# Check if you're logged in
docker info | grep Username

# List your local images
docker images | grep yourusername
```

### Pull Errors on Server
```bash
# Make sure you're logged in on the server
docker login

# Try pulling manually to see error
docker pull docker.io/yourusername/backend:latest
```

## Comparison: Docker Hub vs AWS ECR

| Feature | Docker Hub | AWS ECR |
|---------|-----------|---------|
| Setup Complexity | ⭐ Simple | ⭐⭐ Moderate |
| Cost | Free (public) | Pay per GB storage |
| Login | `docker login` | AWS CLI + credentials |
| Speed | Fast globally | Fast in AWS regions |
| Best For | Simple deployments | AWS-only infrastructure |

## Security Tips

1. **Use tags for versions**: Instead of always using `latest`, tag with versions:
   ```bash
   ./deploy-dockerhub.sh yourusername v1.0.0
   ```

2. **Private repos for production**: Use private repositories for production images

3. **Access tokens**: Use Docker Hub access tokens instead of passwords:
   - Go to Account Settings → Security → New Access Token
   - Use token as password when logging in

4. **Don't commit secrets**: Never commit Docker Hub credentials to git

## Useful Commands

```bash
# View all your images
docker images | grep yourusername

# Remove old images locally
docker rmi docker.io/yourusername/backend:old-tag

# View image layers
docker history docker.io/yourusername/backend:latest

# Test image locally before pushing
docker run -p 3000:3000 docker.io/yourusername/backend:latest
```

