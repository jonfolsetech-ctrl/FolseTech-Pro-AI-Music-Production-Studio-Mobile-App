# Deployment Guide

## Prerequisites

- Google Cloud Platform account with billing enabled
- Firebase project created
- Docker installed
- Terraform installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- GCP CLI installed (`gcloud`)

## Initial Setup

### 1. GCP Setup

```bash
# Login to GCP
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  containerregistry.googleapis.com \
  redis.googleapis.com \
  compute.googleapis.com
```

### 2. Firebase Setup

```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select:
# - Hosting
# - Firestore
# - Storage
```

### 3. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your actual credentials
nano .env
```

Required environment variables:
- Firebase credentials (API key, project ID, etc.)
- Stripe API keys
- GCP project ID and region

## Deployment Steps

### Option 1: Automated Deployment

```bash
# Make deploy script executable
chmod +x infra/scripts/deploy.sh

# Run deployment
./infra/scripts/deploy.sh
```

### Option 2: Manual Deployment

#### Step 1: Build and Push Docker Images

```bash
# Set your project ID
PROJECT_ID=your-project-id

# Build API image
docker build -t gcr.io/$PROJECT_ID/folsetech-ai-api:latest ./apps/api

# Build AI service image (requires GPU support)
docker build -t gcr.io/$PROJECT_ID/folsetech-ai-service:latest -f Dockerfile.gpu .

# Push images to Google Container Registry
docker push gcr.io/$PROJECT_ID/folsetech-ai-api:latest
docker push gcr.io/$PROJECT_ID/folsetech-ai-service:latest
```

#### Step 2: Deploy Infrastructure with Terraform

```bash
cd infra/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan \
  -var="project_id=$PROJECT_ID" \
  -var="region=us-central1"

# Apply infrastructure
terraform apply \
  -var="project_id=$PROJECT_ID" \
  -var="region=us-central1"

cd ../..
```

#### Step 3: Deploy Web App to Firebase

```bash
cd apps/web

# Install dependencies
npm install

# Build production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

cd ../..
```

#### Step 4: Deploy Firestore Rules and Indexes

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

## Post-Deployment Configuration

### 1. Configure Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://YOUR_API_URL/api/webhook`
3. Select events: `payment_intent.succeeded`
4. Copy webhook secret to `.env`

### 2. Configure CORS for Cloud Storage

```bash
cat > cors.json << EOF
[
  {
    "origin": ["https://YOUR_DOMAIN.web.app"],
    "method": ["GET", "POST"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://YOUR_BUCKET_NAME
```

### 3. Set up Cloud Run Environment Variables

```bash
gcloud run services update folsetech-ai-api \
  --set-env-vars="STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY" \
  --set-env-vars="FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID" \
  --region=us-central1
```

## GPU Configuration for AI Service

### Enable GPU on Cloud Run (Gen2)

```bash
gcloud run deploy folsetech-ai-service \
  --image=gcr.io/$PROJECT_ID/folsetech-ai-service:latest \
  --platform=managed \
  --region=us-central1 \
  --execution-environment=gen2 \
  --gpu=1 \
  --gpu-type=nvidia-tesla-t4 \
  --memory=8Gi \
  --cpu=4
```

## Monitoring and Logging

### View Logs

```bash
# API logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=folsetech-ai-api" --limit 50

# AI service logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=folsetech-ai-service" --limit 50
```

### Set up Monitoring Alerts

1. Go to GCP Console → Monitoring
2. Create alerting policies for:
   - High error rates
   - High latency
   - Resource exhaustion

## Scaling Configuration

### Auto-scaling Settings

Edit `infra/terraform/main.tf`:

```hcl
resource "google_cloud_run_service" "api" {
  # ...
  
  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "1"
        "autoscaling.knative.dev/maxScale" = "100"
      }
    }
  }
}
```

### Redis Memory Tier

For production, upgrade Redis to Standard HA:

```hcl
resource "google_redis_instance" "cache" {
  tier           = "STANDARD_HA"
  memory_size_gb = 5
}
```

## Backup and Recovery

### Firestore Backups

```bash
# Create backup
gcloud firestore export gs://YOUR_BACKUP_BUCKET

# Restore from backup
gcloud firestore import gs://YOUR_BACKUP_BUCKET/backup-folder
```

### Storage Backups

Enable versioning on Cloud Storage:

```bash
gsutil versioning set on gs://YOUR_BUCKET_NAME
```

## Rollback Procedure

### Rollback Cloud Run Deployment

```bash
# List revisions
gcloud run revisions list --service=folsetech-ai-api

# Rollback to previous revision
gcloud run services update-traffic folsetech-ai-api \
  --to-revisions=REVISION_NAME=100
```

### Rollback Firebase Hosting

```bash
firebase hosting:rollback
```

## Troubleshooting

### Common Issues

**Issue: Container fails to start**
- Check logs: `gcloud run services logs read folsetech-ai-api`
- Verify environment variables are set
- Check image exists in GCR

**Issue: GPU not available**
- Ensure region supports GPUs
- Check quota limits
- Verify execution environment is set to gen2

**Issue: Firebase deployment fails**
- Run `firebase login --reauth`
- Check project permissions
- Verify build output exists in `apps/web/dist`

## Cost Optimization

1. **Cloud Run**: Set min instances to 0 for non-production
2. **Redis**: Use Basic tier for development
3. **Storage**: Set lifecycle policies to delete old files
4. **Monitoring**: Set retention policies

## Security Checklist

- [ ] Enable Cloud Armor for DDoS protection
- [ ] Set up VPC Service Controls
- [ ] Enable audit logging
- [ ] Rotate service account keys regularly
- [ ] Use Secret Manager for sensitive data
- [ ] Enable HTTPS only
- [ ] Configure proper CORS policies
- [ ] Set up authentication on all endpoints

## Production Checklist

- [ ] Domain configured and SSL certificate active
- [ ] Monitoring alerts configured
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Documentation updated
- [ ] Team trained on operations
- [ ] Incident response plan documented

## Support

For deployment issues, contact support@folsetech.com
