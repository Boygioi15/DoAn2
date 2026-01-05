#!/bin/bash

# Push script for Docker images to registry
# Usage: ./push-images.sh [registry-url] [tag]
# Example: ./push-images.sh your-aws-account.dkr.ecr.region.amazonaws.com latest

set -e

if [ -z "$1" ]; then
    echo "Error: Registry URL is required"
    echo "Usage: ./push-images.sh <registry-url> [tag]"
    echo "Example: ./push-images.sh your-aws-account.dkr.ecr.region.amazonaws.com latest"
    exit 1
fi

REGISTRY=$1
TAG=${2:-"latest"}

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Pushing images to ${REGISTRY}...${NC}"

# Check if images exist
if ! docker image inspect ${REGISTRY}/backend:${TAG} > /dev/null 2>&1; then
    echo -e "${RED}Error: Image ${REGISTRY}/backend:${TAG} not found${NC}"
    echo -e "${BLUE}Run ./build-images.sh ${REGISTRY} ${TAG} first${NC}"
    exit 1
fi

# Push backend
echo -e "${GREEN}Pushing backend image...${NC}"
docker push ${REGISTRY}/backend:${TAG}

# Push frontend-admin
echo -e "${GREEN}Pushing frontend-admin image...${NC}"
docker push ${REGISTRY}/frontend-admin:${TAG}

# Push frontend-client
echo -e "${GREEN}Pushing frontend-client image...${NC}"
docker push ${REGISTRY}/frontend-client:${TAG}

echo -e "${GREEN}All images pushed successfully!${NC}"

