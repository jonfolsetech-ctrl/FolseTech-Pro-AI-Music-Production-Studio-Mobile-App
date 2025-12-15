#!/bin/bash

set -e

echo "🧪 Running local development environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Copy .env.example to .env and configure it."
    exit 1
fi

# Start services with docker-compose
docker-compose -f infra/docker/docker-compose.yml up --build

echo "🎉 Services started!"
echo "Web: http://localhost:3000"
echo "API: http://localhost:4000"
echo "AI Service: http://localhost:8000"
