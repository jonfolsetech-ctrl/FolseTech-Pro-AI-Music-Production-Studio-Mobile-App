# AWS Amplify Deployment Guide

## Prerequisites

1. AWS Account with Amplify access
2. GitHub repository connected to AWS Amplify
3. Stripe account (for payments)
4. AWS Bedrock access (for AI features)
5. Redis instance (for job queue)

## Deployment Steps

### 1. Connect Repository to AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Select GitHub as the repository service
4. Authorize AWS Amplify to access your repository
5. Select `jonfolsetech-ctrl/FolseTech-Pro-AI-Music-Production-Studio-Mobile-App`
6. Select branch: `main`

### 2. Configure Build Settings

Amplify will automatically detect the `amplify.yml` file at the root. This file configures:
- **Frontend**: React + Vite app in `folsetech-ai-studio/apps/web`
- **Backend**: Node.js API in `folsetech-ai-studio/apps/api`

### 3. Set Environment Variables

In AWS Amplify Console → App Settings → Environment variables, add:

#### Frontend Variables
```
VITE_API_URL = https://your-api-url.com
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_your_stripe_publishable_key
```

#### Backend Variables (if deploying API via Amplify)
```
AWS_REGION = us-east-1
AWS_ACCESS_KEY_ID = your_aws_access_key_id
AWS_SECRET_ACCESS_KEY = your_aws_secret_access_key
STRIPE_SECRET_KEY = sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET = whsec_your_webhook_secret
REDIS_URL = redis://your-redis-host:6379
NODE_ENV = production
CLIENT_URL = https://main.xxxxx.amplifyapp.com
```

### 4. Configure Custom Domain (Optional)

1. Go to App Settings → Domain management
2. Add your custom domain (e.g., `studio.folsetech.com`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning

### 5. Backend API Deployment

**Option A: Deploy Backend on AWS Lambda + API Gateway**

Use AWS SAM or Serverless Framework:

```bash
# Install Serverless Framework
npm install -g serverless

# Create serverless.yml for the API
cd folsetech-ai-studio/apps/api
serverless deploy
```

**Option B: Deploy Backend on AWS Elastic Beanstalk**

```bash
# Install EB CLI
pip install awsebcli

# Initialize Elastic Beanstalk
cd folsetech-ai-studio/apps/api
eb init -p node.js-18 folsetech-api

# Create environment and deploy
eb create folsetech-api-prod
eb deploy
```

**Option C: Deploy Backend on AWS App Runner**

1. Package the API as a Docker container
2. Push to Amazon ECR
3. Create App Runner service pointing to the ECR image

### 6. Redis Setup

**Option A: AWS ElastiCache**

1. Go to ElastiCache Console
2. Create Redis cluster
3. Configure security group to allow access from API
4. Update `REDIS_URL` environment variable

**Option B: Upstash (Serverless Redis)**

1. Sign up at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy connection URL
4. Update `REDIS_URL` environment variable

### 7. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-api-url.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook signing secret
5. Update `STRIPE_WEBHOOK_SECRET` environment variable

### 8. AWS Bedrock Configuration

1. Go to AWS Bedrock Console
2. Request access to Claude models (Anthropic)
3. Enable model access for:
   - `anthropic.claude-3-sonnet-20240229-v1:0`
4. Ensure IAM role/user has permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "bedrock:InvokeModel",
           "bedrock:InvokeModelWithResponseStream"
         ],
         "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.*"
       }
     ]
   }
   ```

### 9. Build and Deploy

Once configured, Amplify will automatically:
1. Build the frontend on every git push to `main`
2. Deploy to CDN (CloudFront)
3. Provide preview URLs for pull requests

### 10. Monitoring and Logs

- **Amplify Console**: Monitor build status and deployments
- **CloudWatch Logs**: View API logs (if using Lambda/Beanstalk)
- **Amplify Monitoring**: Check frontend performance and errors

## Project Structure for Amplify

```
/
├── amplify.yml                    # Amplify build configuration
├── folsetech-ai-studio/
│   ├── .env.example              # Environment variables template
│   ├── apps/
│   │   ├── web/                  # Frontend (deployed to Amplify Hosting)
│   │   │   ├── dist/            # Build output (created by Vite)
│   │   │   ├── public/
│   │   │   │   └── _redirects   # SPA routing redirect rules
│   │   │   ├── src/
│   │   │   ├── package.json
│   │   │   └── vite.config.js
│   │   └── api/                  # Backend (deploy separately)
│   │       ├── server.js
│   │       ├── package.json
│   │       └── ...
│   └── ai/                       # Python AI modules
└── README.md
```

## Important Notes

1. **Frontend is static**: Vite builds to static files served via CDN
2. **Backend is separate**: API must be deployed independently (Lambda, Beanstalk, or App Runner)
3. **Environment variables**: Frontend vars must start with `VITE_`
4. **CORS**: Configure API to allow requests from Amplify domain
5. **Redis**: Required for job queue - must be accessible from API
6. **Python AI**: Deploy as Lambda functions or containerized services

## Troubleshooting

### Build Fails

1. Check Amplify build logs
2. Verify `package.json` scripts
3. Ensure all dependencies are in `package.json` (not just `devDependencies`)

### API Connection Issues

1. Verify `VITE_API_URL` is set correctly
2. Check CORS headers in API
3. Verify API is deployed and accessible
4. Check API logs for errors

### Environment Variables Not Working

1. Ensure frontend vars start with `VITE_`
2. Rebuild app after adding variables
3. Check variable names match exactly

## Cost Estimation

- **Amplify Hosting**: ~$0.01/GB served + $0.023/build minute
- **ElastiCache Redis**: ~$13/month (t3.micro)
- **Lambda API**: Pay per request (very low for moderate traffic)
- **CloudFront (via Amplify)**: ~$0.085/GB

## Security Best Practices

1. Use AWS Secrets Manager for sensitive credentials
2. Enable AWS WAF for API protection
3. Use HTTPS only (Amplify provides SSL automatically)
4. Implement API rate limiting
5. Enable CloudWatch alarms for errors
6. Use IAM roles instead of access keys when possible

## Next Steps

1. Connect GitHub repository to Amplify
2. Configure environment variables
3. Deploy backend API
4. Set up Redis instance
5. Configure Stripe webhooks
6. Test all features in production
7. Set up custom domain
8. Enable monitoring and alerts

For support, refer to:
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Stripe Documentation](https://stripe.com/docs)
