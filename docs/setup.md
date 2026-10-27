# UrbanPulse AI — Local Development & Setup Guide

## Overview
**UrbanPulse AI** is an AI-powered Urban Operations Monitoring and Optimization Platform for municipal local bodies (piloted in Mira-Bhayandar, Maharashtra, India).

---

## Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Python**: v3.10+ or v3.11+
- **MongoDB**: (Optional) MongoDB Atlas or local MongoDB service. If no MongoDB connection string is provided, the platform automatically activates its built-in in-memory `mongomock` engine.

---

## 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run database seed (Optional: auto-seeds on first startup if empty)
python scripts/seed_demo.py

# Start FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend API will be live at:
- **API Base**: `http://localhost:8000/api`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/api/health`

---

## 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start Vite development server
npm run dev
```

The frontend application will be live at:
- **Web App**: `http://localhost:5173/`

---

## 3. Seed Accounts & Demo Credentials

The platform is bootstrapped with demonstration accounts for immediate evaluation:

### Administrator Account:
- **Email**: `admin@urbanpulse.ai`
- **Password**: `AdminPassword123!`
- **Role**: `admin` (Has access to `/admin/dashboard`, `/admin/issues`, `/admin/insights`, and CSV export)

### Citizen Accounts:
- **Citizen 1**: `citizen@example.com` / `CitizenPassword123!`
- **Citizen 2**: `priya.patel@example.com` / `CitizenPassword123!`
- **Role**: `citizen` (Has access to citizen reporting and private submission dashboard)

*Tip: The login page includes 1-click quick-fill buttons for both Demo Citizen and Demo Admin.*

---

## 4. Running Tests

### Backend Tests:
```bash
cd backend
.\venv\Scripts\pytest
```

### Frontend Tests:
```bash
cd frontend
npm run test
```
