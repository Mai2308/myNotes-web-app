# Vercel Environment Variables Setup

## Required Environment Variables

Add these to your Vercel project:

**Go to: Vercel Dashboard → Your Project → Settings → Environment Variables**

### 1. MONGO_URI
```
mongodb+srv://MyNotesDB:jpKcFRgzfmfoStS8@mynoteswebapp.m8ivge8.mongodb.net/?appName=MyNotesWebApp
```

### 2. JWT_SECRET
```
secret123
```

### 3. REACT_APP_API_URL
```
/api
```

### 4. NODE_ENV (Optional but recommended)
```
production
```

### 5. CORS_ORIGIN (Optional - for security)
```
*
```
(Change to your actual domain once deployed)

---

## After Adding Variables

1. Save all variables
2. Redeploy your project
3. Test the application

---

## Security Notes

⚠️ **Important**: After deployment works, you should:
1. Change `JWT_SECRET` to a strong random string
2. Update `CORS_ORIGIN` to your actual Vercel domain
3. Consider rotating MongoDB credentials
