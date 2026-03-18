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

After the first deployment, run Prisma migrations. **Important**: The default `DATABASE_URL` uses Railway's internal hostname (`postgres.railway.internal`) which only resolves within Railway's network, so running migrations from your local machine requires the public database URL.

**Option 1: Railway CLI with Service Context (Recommended)**

Use the Railway CLI to run commands in the context of your deployed service:

1. Install Railway CLI (if not already installed):
   ```bash
   npm i -g @railway/cli
   ```

2. Login and link to your project:
   ```bash
   railway login
   railway link
   ```

3. Run migrations using the service context:
   ```bash
   railway run --service backend npx prisma migrate deploy
   ```

This works because the command runs within Railway's network where `postgres.railway.internal` resolves correctly.

**Option 2: Local Machine with Public Database URL**

If you prefer running from your local machine with a direct database connection:

1. Go to Railway Dashboard → Your Project → PostgreSQL Service
2. Navigate to the **Variables** tab
3. Find the public `DATABASE_URL` (not the internal one)
   - The public URL uses a hostname like `containers-us-west-xxx.railway.app` or `monorail.proxy.railway.internal`
   - The internal URL uses `postgres.railway.internal` (this won't work locally)
4. Copy the public connection string
5. Set it as an environment variable locally:
   ```bash
   export DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
   ```
6. Run the migration:
   ```bash
   npx prisma migrate deploy
   ```

**Option 3: Automatic Migrations on Deploy**

Alternatively, you can add a start script that runs migrations before starting:

```json
"start": "npx prisma migrate deploy && node dist/index.js"
```

**Note**: This approach may cause issues if multiple instances start simultaneously and try to run migrations at the same time.

#### Import CEDICT Dictionary Data

After running migrations, import the CEDICT dictionary data required for the dictionary autosuggest feature. The same network considerations apply as with migrations.

**Option 1: Railway CLI with Service Context (Recommended)**

Use the Railway CLI to run the import command in the context of your deployed service:

```bash
railway run --service backend npm run import:cedict -- ./cedict_ts.u8
```

This works because the command runs within Railway's network where `postgres.railway.internal` resolves correctly, and the `cedict_ts.u8` file is included in the Docker image.

**Option 2: Local Machine with Public Database URL**

If you prefer running from your local machine:

1. Get the public `DATABASE_URL` from Railway Dashboard (see instructions in "Run Database Migrations" section)
2. Set it as an environment variable locally
3. Run the import:
   ```bash
   npm run import:cedict -- ./cedict_ts.u8
   ```

**Note**: For local execution, ensure the `cedict_ts.u8` file exists in your local `backend/` directory.

### 4. Deploy Frontend Service

#### Create Frontend Service

1. Click "New" → "GitHub Repository"
2. Select your repository
3. Set the **Root Directory** to `frontend`
4. Railway will detect the Dockerfile automatically

#### Configure Frontend Environment Variables

The frontend requires `VITE_API_URL` to be set to the backend's **public** URL. This is critical because the frontend runs in user browsers, which cannot resolve Railway's internal hostnames.

**Steps to configure:**

1. Go to Railway Dashboard → Backend Service → Settings → Domains
2. Copy the public URL (e.g., `https://hancards-backend.up.railway.app`)
3. Go to Railway Dashboard → Frontend Service → Variables
4. Set `VITE_API_URL` to the backend's public URL
5. **Important**: Redeploy the frontend service after setting this variable

**Why redeploy is required:** Vite embeds environment variables at build time. Changing `VITE_API_URL` requires a full redeploy for the new value to take effect.

**Critical Note:** Do NOT use `*.railway.internal` hostnames (e.g., `backend.railway.internal`). These only resolve within Railway's private network and won't work from user browsers. Always use the public URL from the Domains section.

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

**Testing database connection:**

Use the Railway CLI to test the connection from within Railway's network:

```bash
railway run --service backend npx prisma db push
```

Or use the public `DATABASE_URL` from Railway's PostgreSQL service variables if testing from your local machine.

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

**Option A: Railway CLI with Service Context (Recommended)**

Run migrations using the Railway CLI from your local machine:

```bash
railway run --service backend npx prisma migrate deploy
```

This executes the command within Railway's network where the internal database hostname resolves correctly.

**Option B: Local Machine with Public Database URL**

Use the public `DATABASE_URL` from Railway's PostgreSQL service variables and run migrations locally. See the "Run Database Migrations" section for detailed instructions on obtaining the public URL.

**Option C: Automatic (modify backend package.json)**

```json
"start": "npx prisma migrate deploy && node dist/index.js"
```

**Note**: Automatic migrations may cause issues if multiple instances start simultaneously and try to run migrations at the same time.

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