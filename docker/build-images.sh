#!/bin/bash

# Build script for Docker images
# Usage: ./build-images.sh [registry-url] [tag]
# Example: ./build-images.sh your-aws-account.dkr.ecr.region.amazonaws.com latest
# Example: ./build-images.sh docker.io/yourusername latest

set -e

REGISTRY=${1:-""}
TAG=${2:-"latest"}

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Building Docker images...${NC}"

# Build backend
echo -e "${GREEN}Building backend image...${NC}"
cd ../backend
docker build -t backend:${TAG} .
if [ -n "$REGISTRY" ]; then
    docker tag backend:${TAG} ${REGISTRY}/backend:${TAG}
fi
cd ../docker

# Build frontend-admin
echo -e "${GREEN}Building frontend-admin image...${NC}"
cd ../frontend-admin
docker build --build-arg VITE_API_URL=http://localhost:3000 -t frontend-admin:${TAG} .
if [ -n "$REGISTRY" ]; then
    docker tag frontend-admin:${TAG} ${REGISTRY}/frontend-admin:${TAG}
fi
cd ../docker

# Build frontend-client
echo -e "${GREEN}Building frontend-client image...${NC}"
cd ../frontend-client
docker build --build-arg VITE_API_URL=http://localhost:3000 -t frontend-client:${TAG} .
if [ -n "$REGISTRY" ]; then
    docker tag frontend-client:${TAG} ${REGISTRY}/frontend-client:${TAG}
fi
cd ../docker

echo -e "${GREEN}All images built successfully!${NC}"
if [ -n "$REGISTRY" ]; then
    echo -e "${BLUE}Images tagged with registry: ${REGISTRY}${NC}"
    echo -e "${BLUE}Run ./push-images.sh ${REGISTRY} ${TAG} to push to registry${NC}"
else
    echo -e "${BLUE}Images built locally. Use 'docker-compose up' to run them.${NC}"
fi

