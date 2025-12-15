#!/bin/bash

set -e

echo "🧪 Running local development (without Docker)..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Copy .env.example to .env and configure it."
    exit 1
fi

# Load environment
export $(cat .env | xargs)

echo "📦 Installing dependencies..."

# Install API dependencies
cd apps/api
npm install &
API_PID=$!

# Install web dependencies
cd ../web
npm install &
WEB_PID=$!

wait $API_PID
wait $WEB_PID

cd ../..

echo "🚀 Starting services..."

# Start Redis in background (if installed locally)
if command -v redis-server &> /dev/null; then
    redis-server --daemonize yes
    echo "✓ Redis started"
else
    echo "⚠️  Redis not found. Install with: apt install redis-server"
fi

# Start API server in background
cd apps/api
node server.js &
API_SERVER_PID=$!
echo "✓ API server started (PID: $API_SERVER_PID)"

# Start workers in background
node workers.js &
WORKER_PID=$!
echo "✓ Workers started (PID: $WORKER_PID)"

cd ../..

# Start web dev server
cd apps/web
echo "✓ Starting web dev server..."
npm run dev

# Cleanup on exit
trap "kill $API_SERVER_PID $WORKER_PID 2>/dev/null" EXIT
