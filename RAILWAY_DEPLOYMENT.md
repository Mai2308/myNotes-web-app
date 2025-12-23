# Railway Deployment Guide for Notes Backend

This guide explains how to deploy your Notes App backend on Railway.

## Prerequisites

1. **Railway Account**: Sign up at https://railway.app
2. **GitHub Account**: Your project must be in a GitHub repository
3. **MongoDB**: You'll need a MongoDB connection string (Atlas, or Railway's MongoDB plugin)

## Step 1: Prepare Your Repository

Ensure your backend code is pushed to GitHub. Your repository should have:
- `backend/` folder with `server.js` as the entry point
- `backend/package.json` with proper scripts
- `backend/.env.example` with all required environment variables

✅ Your backend is already properly configured with:
- `package.json` with `"main": "server.js"` and `"start": "node server.js"`
- PORT configuration: `const PORT = process.env.PORT || 5000`
- All required dependencies listed

## Step 2: Set Up Railway Project

### Option A: Using Railway CLI (Recommended)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Railway in your project**
   ```bash
   cd your-repo-root
   railway init
   ```

4. **Link to your GitHub repository**
   - Go to https://railway.app/dashboard
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose your repository
   - Select the `backend` folder as the root directory

### Option B: Using Railway Dashboard

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Select your repository
5. Configure the following:
   - **Root Directory**: `backend`
   - **Build Command**: (Leave empty - you don't need a build step)
   - **Start Command**: `npm start`

## Step 3: Set Up MongoDB

### Option A: MongoDB Atlas (Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string
4. In Railway dashboard, add the environment variable:
   - Key: `MONGO_URI`
   - Value: Your MongoDB Atlas connection string

### Option B: Railway MongoDB Plugin

1. In your Railway project dashboard, click "Add Service"
2. Select "MongoDB"
3. Railway will automatically create `MONGODB_URL` environment variable
4. Add another env var to match your code:
   - Key: `MONGO_URI`
   - Value: `${{ MONGODB_URL }}`

## Step 4: Configure Environment Variables

In your Railway project dashboard, go to **Variables** and add:

```
PORT=
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production

# Email Configuration (for reminder notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# CORS Configuration (add your frontend domain)
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

**Security Notes:**
- Never commit `.env` to GitHub
- Use strong, random values for `JWT_SECRET`
- For Gmail, use App Passwords: https://myaccount.google.com/apppasswords

## Step 5: Deploy

### Via GitHub Integration

1. Push your code to GitHub
2. Railway automatically detects changes and redeploys
3. Monitor logs in the Railway dashboard

### Via Railway CLI

```bash
railway up
```

This command:
- Builds your backend
- Pushes to Railway
- Deploys automatically

## Step 6: Verify Deployment

1. Go to your Railway project dashboard
2. Find your backend service
3. Look for the generated URL (e.g., `https://backend-production-xxxx.railway.app`)
4. Test the health endpoint: `https://your-railway-url/` (should return "🚀 Notes App Backend Running!")
5. Check the logs for any errors

## Step 7: Connect Frontend

Update your frontend's API base URL to point to your Railway deployment:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-railway-url';
```

Or in your `.env` file:
```
REACT_APP_API_URL=https://your-railway-url
```

## Troubleshooting

### Port Issues
- Railway automatically handles port binding
- Your code correctly uses `process.env.PORT || 5000`
- No changes needed

### MongoDB Connection Failed
- Verify `MONGO_URI` is correct
- Check IP whitelist in MongoDB Atlas (allow all IPs for Railway: `0.0.0.0/0`)
- Ensure database exists and user has proper permissions

### Build Fails
- Check the build logs in Railway dashboard
- Ensure `package.json` is in the `backend` folder
- Verify all dependencies are listed (no local file imports)

### CORS Errors
- Update `CORS_ORIGIN` environment variable with your frontend domain
- Remember to include `https://` and remove trailing slashes

### Email Service Not Working
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- For Gmail, confirm you've created an App Password (not your regular password)
- Check Network/Firewall settings in Railway if needed

## Useful Railway Commands

```bash
# Check deployment status
railway status

# View logs in real-time
railway logs

# List all environment variables
railway variables

# Open Railway dashboard in browser
railway open

# Connect to database shell (if using Railway MongoDB)
railway database up
```

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway GitHub Integration](https://docs.railway.app/getting-started)
- [Environment Variables Guide](https://docs.railway.app/develop/variables)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)

## What's Already Done in Your Backend

✅ Express server configured with proper PORT handling
✅ MongoDB connection with error handling
✅ CORS middleware with environment variable support
✅ Health check endpoint at `/`
✅ Graceful shutdown handlers
✅ Environment variable support via dotenv
✅ All required dependencies in package.json

## Next Steps

1. Create a GitHub repository if you haven't already
2. Push your code to GitHub
3. Sign up on Railway
4. Set up MongoDB (Atlas or Railway)
5. Deploy using the steps above
6. Update your frontend to use the Railway URL
7. Test all API endpoints

Happy deploying! 🚀
