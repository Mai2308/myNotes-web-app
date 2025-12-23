# Railway Deployment - Quick Step-by-Step Guide

Follow these steps exactly in order.

---

## STEP 1: Prepare Your Code
```bash
cd backend
npm install
npm start
# Test that your backend runs locally
# Press Ctrl+C to stop
```

---

## STEP 2: Push to GitHub

If not already done:

```bash
cd ..
git init
git add .
git commit -m "Initial commit - ready for Railway"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/your-repo-name.git
git push -u origin main
```

**Replace** `YOUR_USERNAME` and `your-repo-name` with your actual GitHub username and repo name.

---

## STEP 3: Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **Sign Up** (or Sign In if you have an account)
3. Create a new project called "Notes App"
4. Create a cluster (free tier is fine)
5. Click **+ Add New Database User**
   - Username: `notesapp`
   - Password: Generate a secure password (save it!)
6. Click **Network Access** → **Add IP Address**
   - Select **Allow access from anywhere** (0.0.0.0/0)
   - Click **Confirm**
7. Click **Databases** → Your cluster → **Connect** → **Drivers**
8. Copy the connection string
   - Replace `<password>` with your database password
   - Replace `myFirstDatabase` with `notesapp`
   - Example: `mongodb+srv://notesapp:your-password@cluster.mongodb.net/notesapp?retryWrites=true&w=majority`
   - **Save this connection string** - you'll need it soon

---

## STEP 4: Create Railway Account

1. Go to https://railway.app
2. Click **Sign Up**
3. Sign up with GitHub (easiest)
4. Authorize Railway to access GitHub

---

## STEP 5: Create Railway Project

1. Click **Dashboard** (or go to https://railway.app/dashboard)
2. Click **New Project**
3. Click **Deploy from GitHub repo**
4. Select your repository from the list
5. Click **Deploy Now**
6. Wait for initial build (2-3 minutes)

---

## STEP 6: Set Root Directory

After Railway finishes building:

1. Click your project
2. Click the service that was created
3. Go to the **Settings** tab
4. Find **Root Directory**
5. Change it from `/` to `backend`
6. Click **Save**
7. Wait for redeploy

---

## STEP 7: Add Environment Variables

1. In your Railway service, go to the **Variables** tab
2. Click **Raw Editor**
3. Paste this (replace with your actual values):

```
PORT=
MONGO_URI=mongodb+srv://notesapp:YOUR-PASSWORD@cluster.mongodb.net/notesapp?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-here-make-it-long-and-random-abc123xyz789
NODE_ENV=production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
CORS_ORIGIN=*
```

**Replace these with your actual values:**
- `YOUR-PASSWORD` - Your MongoDB password
- `your-super-secret-key-here...` - Any random string (at least 32 characters)
- `your-email@gmail.com` - Your email
- `your-app-specific-password` - Your Gmail app password

4. Click **Deploy**
5. Wait for deployment to complete

---

## STEP 8: Get Your Backend URL

1. In Railway dashboard, click your service
2. Go to the **Deployments** tab
3. Look for the **URL** field (top right)
4. Copy the URL - it looks like: `https://notes-backend-prod-xxxx.railway.app`
5. Test it by visiting: `https://your-url/` 
   - You should see: `🚀 Notes App Backend Running!`

---

## STEP 9: Check Logs for Errors

1. In Railway service, click the **Logs** tab
2. Look for any red error messages
3. If you see connection errors:
   - Check your `MONGO_URI` is correct
   - Check your MongoDB password is correct
   - Verify IP whitelist in MongoDB Atlas includes `0.0.0.0/0`

---

## STEP 10: Update Your Frontend

If you have a frontend deployed, update it to use your Railway backend:

1. Go to your frontend deployment (Vercel, etc.)
2. Add environment variable:
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-railway-url` (from Step 8)
3. Redeploy your frontend

---

## ✅ You're Done!

Your backend is now live on Railway!

### Test Your Deployment:
- Visit: `https://your-railway-url/`
- Create a test user through your frontend
- Check if notes, folders, etc. work

### Troubleshooting:
- **Check logs**: Click Logs tab in Railway service
- **MongoDB connection failed**: Verify connection string and IP whitelist
- **Port error**: Make sure PORT variable is empty or not set
- **CORS errors**: Update CORS_ORIGIN to your frontend domain

### Need to make changes?
1. Push to GitHub: `git push`
2. Railway auto-deploys (watch the Logs tab)
3. Takes 2-3 minutes to rebuild and deploy

---

**📚 Need more info?** See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)
