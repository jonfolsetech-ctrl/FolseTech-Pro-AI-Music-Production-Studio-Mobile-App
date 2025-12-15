#!/bin/bash

echo "==================================="
echo "FolseTech AI Studio - Status Check"
echo "==================================="
echo ""

# Check Redis
if docker ps | grep -q docker-redis; then
    echo "✅ Redis: Running (Docker)"
else
    echo "❌ Redis: Not running"
fi

# Check API
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo "✅ API Server: Running on port 4000"
else
    echo "❌ API Server: Not running"
fi

# Check Web
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Web App: Running on port 3000"
else
    echo "❌ Web App: Not running"
fi

echo ""
echo "==================================="
echo "Access URLs:"
echo "  Web:  http://localhost:3000"
echo "  API:  http://localhost:4000"
echo "==================================="
