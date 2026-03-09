# HànCards Railway Deployment Guide

This guide explains how to deploy the HànCards application to Railway.

## Prerequisites

- Railway account ([railway.app](https://railway.app))
- Railway CLI installed (optional): `npm i -g @railway/cli`
- Git repository with your code

## Architecture

HànCards is a monorepo with two services:
- **Backend**: Express.js API with Prisma ORM (Node.js)
- **Frontend**: Vite React app served by Nginx

## Deployment Steps

### 1. Create a New Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub repository

### 2. Provision PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically set up the database
4. Note the database connection details (available in the database service variables)

### 3. Deploy Backend Service

#### Create Backend Service

1. Click "New" → "GitHub Repository"
2. Select your repository
3. Set the **Root Directory** to `backend`
4. Railway will detect the Dockerfile automatically

#### Configure Backend Environment Variables

Set these environment variables in the Railway backend service:

```bash
# Required
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Reference Railway PostgreSQL
JWT_SECRET=your-production-jwt-secret-min-32-chars

# Optional (Railway sets these automatically)
PORT=3001
NODE_ENV=production
```

**Important**: The `DATABASE_URL` can be referenced from the PostgreSQL service using Railway's variable reference syntax: `${{Postgres.DATABASE_URL}}`

#### Run Database Migrations

After the first deployment, run Prisma migrations:

```bash
# Using Railway CLI
railway run --service backend npx prisma migrate deploy

# Or via Railway dashboard terminal
npx prisma migrate deploy
```

Alternatively, you can add a start script that runs migrations before starting:

```json
"start": "npx prisma migrate deploy && node dist/index.js"
```

### 4. Deploy Frontend Service

#### Create Frontend Service

1. Click "New" → "GitHub Repository"
2. Select your repository
3. Set the **Root Directory** to `frontend`
4. Railway will detect the Dockerfile automatically

#### Configure Frontend Environment Variables

Set these environment variables:

```bash
# Build-time variable (must be set before deployment)
VITE_API_URL=https://your-backend-service.up.railway.app
```

**Note**: Replace `your-backend-service` with your actual backend Railway URL.

#### Configure Build Args

In Railway dashboard, set the build argument:
- `VITE_API_URL` = your backend URL

### 5. Configure Custom Domains (Optional)

1. Go to your service settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Environment Variables Reference

### Backend Service

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (auto-set by Railway) |
| `JWT_SECRET` | Yes | Secret key for JWT tokens (min 32 characters) |
| `PORT` | No | Server port (Railway sets automatically) |
| `NODE_ENV` | No | Set to `production` |

### Frontend Service

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL (build-time) |

## Health Checks

- **Backend**: `GET /health` → Returns `{ "status": "ok", "timestamp": "..." }`
- **Frontend**: `GET /health` → Returns `OK`

## Useful Railway CLI Commands

```bash
# Login to Railway
railway login

# Link to existing project
railway link

# View logs
railway logs --service backend
railway logs --service frontend

# Run commands in service
railway run --service backend npx prisma studio

# Open PostgreSQL CLI
railway connect postgres

# Deploy manually
railway up
```

## Troubleshooting

### Database Connection Issues

1. Verify `DATABASE_URL` is correctly set
2. Check if PostgreSQL service is running
3. Ensure Prisma schema matches database

```bash
# Test database connection
railway run --service backend npx prisma db push
```

### Frontend Not Connecting to Backend

1. Verify `VITE_API_URL` is correctly set with the backend URL
2. Check CORS configuration in backend
3. Ensure backend health check passes

### Build Failures

1. Check build logs in Railway dashboard
2. Verify all dependencies are in `package.json`
3. Ensure TypeScript compiles without errors

## Files Created for Railway Deployment

```
/
├── railway.toml              # Railway project configuration
├── backend/
│   ├── Dockerfile           # Backend container definition
│   ├── .dockerignore        # Docker ignore file
│   └── package.json         # Updated with postinstall script
└── frontend/
    ├── Dockerfile           # Frontend container definition
    ├── nginx.conf           # Nginx configuration for SPA
    └── .dockerignore        # Docker ignore file
```

## Database Migrations Strategy

For production deployments:

1. **Development**: Use `prisma migrate dev` to create migrations
2. **Production**: Use `prisma migrate deploy` to apply migrations

The `postinstall` script runs `prisma generate` automatically.

### Running Migrations on Deploy

Option A: Manual (recommended for first deploy)
```bash
railway run --service backend npx prisma migrate deploy
```

Option B: Automatic (modify backend package.json)
```json
"start": "npx prisma migrate deploy && node dist/index.js"
```

## Monitoring

- View logs: Railway Dashboard → Service → Logs
- Metrics: Railway Dashboard → Service → Metrics
- Health: Check `/health` endpoints

## Scaling

Railway automatically handles basic scaling. For more control:
- Adjust instance count in service settings
- Configure autoscaling based on metrics

## Security Best Practices

1. **Never commit `.env` files**
2. Use strong `JWT_SECRET` (minimum 32 characters)
3. Enable HTTPS (Railway does this automatically)
4. Keep dependencies updated
5. Use Railway's private networking for inter-service communication