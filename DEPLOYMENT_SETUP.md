# Deployment Architecture

## Frontend
- **Platform**: Vercel
- **Repository**: This repo (frontend folder)
- **Build**: `npm run build` → `frontend/build`
- **Environment**: Set `REACT_APP_API_URL` in Vercel dashboard

## Backend
- **Options**: Render, Railway, Heroku, or your own server
- **Setup**: Deploy `api/` or `backend/` folder
- **Environment Variables** needed:
  - `MONGODB_URI` - Your MongoDB connection string
  - `JWT_SECRET` - Secret for JWT tokens
  - `CORS_ORIGIN` - Frontend URL (e.g., https://your-frontend.vercel.app)
  - Other environment variables from `.env`

## Quick Setup

### Option 1: Deploy Frontend on Vercel
1. Go to https://vercel.com/new
2. Import this GitHub repo
3. Set root directory to `frontend`
4. Add environment variable: `REACT_APP_API_URL=https://your-backend-url.com`
5. Deploy

### Option 2: Deploy Backend (Choose One)

**Render.com (Recommended - Free tier)**
1. Push `api/` folder to GitHub
2. Go to https://render.com/dashboard
3. New → Web Service
4. Connect GitHub repo
5. Set Root Directory: `api`
6. Add Environment Variables (see above)
7. Deploy

**Railway.app**
1. Go to https://railway.app
2. New Project → GitHub Repo
3. Select `api` directory
4. Add Environment Variables
5. Deploy

**Heroku**
1. Create Procfile in `api/` folder:
   ```
   web: node app.js
   ```
2. `git push heroku main`

## Environment Variables for Backend

Create `.env` file in backend folder:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
PORT=5000
```

## Frontend .env

Create `.env.local` in frontend folder:
```
REACT_APP_API_URL=https://your-backend-url.com
```

Or set in Vercel dashboard:
- `REACT_APP_API_URL` = `https://your-backend-url.com`
