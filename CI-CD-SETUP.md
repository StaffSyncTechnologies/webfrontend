# StaffSync Web App CI/CD Setup

This document explains the CI/CD pipeline for the StaffSync web application using GitHub Actions.

## Overview

The CI/CD pipeline automatically builds and deploys the web application to different environments based on the branch:

- **Development Branch (`dev`/`develop`)**: Deploys to `http://web.staffsynctech.co.uk`
- **Production Branch (`main`/`production`)**: Deploys to `https://www.staffsynctech.co.uk`

## Required GitHub Secrets

### Development Environment Secrets

Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

```bash
# Development server access
DEV_HOST=138.68.175.49
DEV_USER=root
DEV_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
[Your SSH private key content]
-----END OPENSSH PRIVATE KEY-----

# Development API configuration
DEV_API_KEY=990ef49add9082155b6faf7facc842484286d9a2d3017588cdf372eb1049fc46
```

### Production Environment Secrets

```bash
# Production server access
PROD_HOST=167.172.54.183
PROD_USER=root
PROD_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
[Your production SSH private key content]
-----END OPENSSH PRIVATE KEY-----

# Production API configuration
PROD_API_KEY=your-production-api-key-unique-and-secure
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key

# Vercel deployment (optional)
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
```

## Workflow Triggers

### Development Deployment
- Push to `dev` or `develop` branch
- Manual workflow dispatch
- Pull request merged to `dev` or `develop`

### Production Deployment
- Push to `main` or `production` branch
- Manual workflow dispatch
- Release published

## Pipeline Stages

### 1. Test Stage
- Install dependencies
- Run type checking
- Run linting
- Build application

### 2. Deploy Stage
- Build application with environment variables
- Deploy to server via SSH
- Update nginx configuration
- Reload nginx

### 3. Notify Stage
- Report deployment status
- Provide access URLs

## Environment Variables

The pipeline uses different environment variables based on the deployment target:

### Development
```bash
VITE_API_BASE_URL=https://dev.staffsynctech.co.uk/api/v1
VITE_API_KEY=990ef49add9082155b6faf7facc842484286d9a2d3017588cdf372eb1049fc46
```

### Production
```bash
VITE_API_BASE_URL=https://api.staffsynctech.co.uk/api/v1
VITE_API_KEY=your-production-api-key-unique-and-secure
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
```

## Deployment Architecture

### Development (138.68.175.49)
- **Web**: `http://web.staffsynctech.co.uk` (proxies to localhost:5173)
- **API**: `https://dev.staffsynctech.co.uk/api/v1`
- **Files**: `/var/www/staffsync/web/`

### Production (167.172.54.183)
- **Web**: `https://www.staffsynctech.co.uk` (static files)
- **API**: `https://api.staffsynctech.co.uk/api/v1`
- **Files**: `/var/www/staffsync-prod/web/`

## Local Development Setup

For local development, you can still use the proxy setup:

1. Start local dev server:
   ```bash
   cd frontend/web
   npm run dev
   ```

2. Access via domain: `http://web.staffsynctech.co.uk`

## Troubleshooting

### Common Issues

1. **SSH Key Permission Denied**
   - Ensure SSH key is correctly formatted in GitHub secrets
   - Check that the server accepts the SSH key

2. **Build Failures**
   - Check environment variables in GitHub secrets
   - Verify all dependencies are installed correctly

3. **Nginx Configuration Errors**
   - Test nginx config: `nginx -t`
   - Check nginx logs: `journalctl -u nginx`

### Manual Deployment

If CI/CD fails, you can deploy manually:

```bash
# Development
./scripts/deploy-dev-web.sh

# Production (when ready)
./scripts/deploy-production-web.sh
```

## Monitoring

- Check GitHub Actions workflow runs in the "Actions" tab
- Monitor deployment logs for any errors
- Test deployed applications after each deployment

## Security Notes

- SSH keys should be kept secure and rotated regularly
- API keys should be different between environments
- Never commit sensitive data to the repository
- Use GitHub's environment protection rules for production deployments
