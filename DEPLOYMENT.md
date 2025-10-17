# Deployment Guide for Smart Browser

## Deploying to Render

### Backend Deployment

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy Backend to Render**:
   - Go to [render.com](https://render.com)
   - Sign up/Login with your GitHub account
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: `smartbrowser-backend`
     - **Environment**: `Node`
     - **Build Command**: `cd Backend && npm install`
     - **Start Command**: `cd Backend && npm start`
     - **Plan**: Free

3. **Set Environment Variables** in Render:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (or leave empty for auto-assignment)
   - `FRONTEND_URL` = `https://your-frontend-app.vercel.app` (update after frontend deployment)

### Frontend Deployment

1. **Deploy Frontend to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "New Project"
   - Import your repository
   - Configure the project:
     - **Framework Preset**: Vite
     - **Root Directory**: `Frontend/smartbrowser`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

2. **Set Environment Variables** in Vercel:
   - `VITE_BACKEND_URL` = `https://your-backend-url.onrender.com` (update with actual backend URL)

### Alternative: Deploy Both to Render

You can also deploy both frontend and backend to Render using the `render.yaml` file:

1. **Push the render.yaml file** to your repository
2. **In Render Dashboard**:
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will automatically detect and deploy both services

### Post-Deployment Steps

1. **Update Backend Environment Variables**:
   - Go to your backend service in Render
   - Update `FRONTEND_URL` with your actual frontend URL

2. **Update Frontend Environment Variables**:
   - Go to your frontend service in Vercel
   - Update `VITE_BACKEND_URL` with your actual backend URL

3. **Test the Application**:
   - Visit your frontend URL
   - Create a room and test real-time collaboration
   - Test code execution features

### Important Notes

- **Free Tier Limitations**: Both Render and Vercel free tiers have limitations
- **Cold Starts**: Free tier services may have cold start delays
- **WebSocket Support**: Both platforms support WebSockets
- **Environment Variables**: Make sure to set all required environment variables
- **CORS Configuration**: The backend is configured to allow requests from your frontend domain

### Troubleshooting

1. **Connection Issues**: Check that environment variables are set correctly
2. **Build Failures**: Ensure all dependencies are in package.json
3. **WebSocket Issues**: Verify CORS configuration in backend
4. **Code Execution**: Some languages may not be available on free tiers

### URLs to Update

After deployment, update these URLs in your configuration:
- Backend: `https://smartbrowser-backend.onrender.com`
- Frontend: `https://your-app-name.vercel.app`