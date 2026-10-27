# UrbanPulse AI — Production Deployment Guide

## Architecture Overview
- **Frontend**: Vite + React + Tailwind CSS SPA (Deployable to Vercel, Netlify, or AWS S3 + CloudFront).
- **Backend**: FastAPI + Uvicorn ASGI Application (Deployable to Render, Railway, Fly.io, AWS App Runner, or Docker).
- **Database**: MongoDB Atlas Managed Cluster (or self-hosted MongoDB 7+ replica set).

---

## 1. MongoDB Atlas Configuration
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write privileges.
3. In **Network Access**, whitelist your hosting provider's IP range or use `0.0.0.0/0` with a strong password.
4. Copy the connection string format:
   `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
5. Supply this connection string as the `MONGODB_URI` environment variable on your backend host.

---

## 2. Deploying Backend on Render / Railway
1. **Repository**: Link your Git repository.
2. **Root Directory**: `backend`
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**:
   - `ENVIRONMENT=production`
   - `DEBUG=False`
   - `JWT_SECRET_KEY=<generate-strong-random-hex-string>`
   - `MONGODB_URI=<your-mongodb-atlas-uri>`
   - `MONGODB_DB_NAME=urbanpulse_prod`
   - `ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app`

---

## 3. Deploying Frontend on Vercel
1. Link your repository in Vercel.
2. Set **Root Directory** to `frontend`.
3. **Framework Preset**: Vite.
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Environment Variables**:
   - `VITE_API_BASE_URL=https://your-backend-domain.onrender.com/api`
   - `VITE_APP_NAME=UrbanPulse AI`

---

## 4. Docker Deployment
You can also run both the backend and frontend using Docker Compose:

```bash
docker-compose up --build
```
This boots:
- Backend on port `8000`
- Frontend on port `5173`
- (Optional) MongoDB service on port `27017`
