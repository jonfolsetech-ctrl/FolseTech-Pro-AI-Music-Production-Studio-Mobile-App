#!/bin/bash

set -e

echo "🚀 Deploying FolseTech AI Studio..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

PROJECT_ID=${FIREBASE_PROJECT_ID}
REGION=${GCP_REGION:-us-central1}

echo "📦 Building Docker images..."

# Build API image
docker build -t gcr.io/$PROJECT_ID/folsetech-ai-api:latest ./apps/api

# Build AI service image
docker build -t gcr.io/$PROJECT_ID/folsetech-ai-service:latest -f Dockerfile.gpu .

echo "🔼 Pushing images to GCR..."
docker push gcr.io/$PROJECT_ID/folsetech-ai-api:latest
docker push gcr.io/$PROJECT_ID/folsetech-ai-service:latest

echo "🏗️  Deploying infrastructure with Terraform..."
cd infra/terraform
terraform init
terraform apply -auto-approve \
    -var="project_id=$PROJECT_ID" \
    -var="region=$REGION"
cd ../..

echo "🔥 Deploying web app to Firebase..."
cd apps/web
npm install
npm run build
firebase deploy
cd ../..

echo "✅ Deployment complete!"
echo "🌐 Check Firebase Hosting URL for your web app"
