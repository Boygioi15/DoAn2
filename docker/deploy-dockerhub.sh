#!/bin/bash

# Docker Hub Deployment Script
# This script builds images locally and pushes them to Docker Hub
# Usage: ./deploy-dockerhub.sh <dockerhub-username> [tag]
# Example: ./deploy-dockerhub.sh myusername latest

set -e

if [ -z "$1" ]; then
    echo "Error: Docker Hub username is required"
    echo "Usage: ./deploy-dockerhub.sh <dockerhub-username> [tag]"
    echo "Example: ./deploy-dockerhub.sh myusername latest"
    exit 1
fi

DOCKERHUB_USERNAME=$1
TAG=${2:-"latest"}
REGISTRY="${DOCKERHUB_USERNAME}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Docker Hub Deployment ===${NC}"
echo -e "${BLUE}Username: ${DOCKERHUB_USERNAME}${NC}"
echo -e "${BLUE}Tag: ${TAG}${NC}"
echo ""

# Check if logged in to Docker Hub
echo -e "${YELLOW}Checking Docker Hub login...${NC}"
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}Please login to Docker Hub:${NC}"
    docker login
else
    echo -e "${GREEN}Already logged in to Docker Hub${NC}"
fi

# Build images
echo -e "${YELLOW}Building images locally...${NC}"
./build-images.sh ${REGISTRY} ${TAG}

# Push images
echo -e "${YELLOW}Pushing images to Docker Hub...${NC}"
./push-images.sh ${REGISTRY} ${TAG}

echo ""
echo -e "${GREEN}=== Images pushed to Docker Hub successfully! ===${NC}"
echo ""
echo -e "${BLUE}Images available at:${NC}"
echo -e "${GREEN}  ${DOCKERHUB_USERNAME}/backend:${TAG}${NC}"
echo -e "${GREEN}  ${DOCKERHUB_USERNAME}/frontend-admin:${TAG}${NC}"
echo -e "${GREEN}  ${DOCKERHUB_USERNAME}/frontend-client:${TAG}${NC}"
echo ""
echo -e "${YELLOW}=== To deploy on EC2 or any server ===${NC}"
echo -e "${BLUE}1. Login to Docker Hub:${NC}"
echo -e "${GREEN}   docker login${NC}"
echo ""
echo -e "${BLUE}2. Run deployment:${NC}"
echo -e "${GREEN}   REGISTRY=${REGISTRY} TAG=${TAG} docker-compose -f docker-compose.prod.yml up -d${NC}"
echo ""
echo -e "${BLUE}Or use the ec2-deploy-dockerhub.sh script on your server${NC}"

