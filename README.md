# UrbanPulse AI — Smart City Operations Platform

> **"Smarter Cities. Faster Responses. Sustainable Futures."**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0+-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9+-199900.svg?logo=leaflet&logoColor=white)](https://leafletjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Compatible-47A248.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Tests](https://img.shields.io/badge/Tests-Pytest_%26_Vitest_Passing-brightgreen.svg)]()

---

## 1. Project Overview & Academic Identity

- **Product Name**: UrbanPulse AI
- **Tagline**: *"Smarter Cities. Faster Responses. Sustainable Futures."*
- **Primary Context**: Mira-Bhayandar, Maharashtra, India
- **Academic Context**: Semester V / IDEA LAB Smart Urban Systems Project
- **Problem Statement**:
  > *"To observe operational patterns in urban environments and demonstrate a very basic system for improvement."*

**UrbanPulse AI** transforms scattered, unstructured citizen complaints into location-aware, prioritized operational intelligence. It empowers urban local bodies (ULBs) and municipal supervisors to triage urgent safety hazards, detect chronic infrastructure bottlenecks (such as chronic garbage accumulation or road surface peeling), and dispatch targeted work orders to field crews with full audit transparency.

### Initial Supported Categories
1. **Potholes & Damaged Roads**: Road craters, sunken utility trenching, asphalt degradation.
2. **Garbage Overflow & Waste Collection**: Overflowing dumper bins, illegal demolition debris dumping, delayed secondary sweeps.
3. **Broken & Malfunctioning Streetlights**: Non-functional luminaires, leaning damaged poles, corridor blackouts.
*(Modular and extensible for drainage, water supply, and parks).*

> **Academic Prototype Notice**: This system is an independent engineering prototype. Unless authorized API credentials are connected, all figures and records are demonstration simulations for Mira-Bhayandar. It is not officially connected to Mira-Bhayandar Municipal Corporation (MBMC).

---

## 2. Technology Stack

### Frontend:
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, custom deep navy/charcoal `#07111F` smart-city theme with electric cyan and teal accents
- **Maps**: Leaflet, React Leaflet, OpenStreetMap tiles with custom SVG marker pins
- **Charts**: Recharts (Area charts for velocity trends, Donut charts for category breakdown, Horizontal bar charts for resolution times)
- **Forms & State**: TanStack React Query, React Router v7, React Hook Form, Zod
- **Icons**: Lucide React

### Backend:
- **Framework**: Python 3.10+ / 3.11+, FastAPI, Pydantic V2, Uvicorn
- **Database**: MongoDB with automatic fallback to embedded `mongomock` when external MongoDB is not present
- **Security**: JWT access tokens (HS256), bcrypt password hashing via passlib, RBAC (Role-Based Access Control)
- **File Handling**: Upload validator with MIME checking, randomized UUID naming, and static file serving

### Testing:
- **Backend**: Pytest with HTTPX TestClient
- **Frontend**: Vitest, React Testing Library, jsdom

---

## 3. Mathematical Priority Scoring Engine

UrbanPulse AI prioritizes complaints using an explainable, deterministic mathematical model:

$$\text{Priority Score} = 0.40 \times \text{Severity Score} + 0.35 \times \text{Recurrence Score} + 0.25 \times \text{Waiting-Time Score}$$

- **Severity (40%)**:
  - `Low` = 25.0
  - `Medium` = 50.0
  - `High` = 75.0
  - `Critical` = 100.0
- **Recurrence (35%)**: Evaluates active or recent complaints of the same category in the same locality within 14 days (0-1 prior = 15, 2-3 prior = 60, 4-6 prior = 85, 7+ prior = 100).
- **Waiting Time (25%)**: Normalized elapsed hours open: $\min\left(100, \frac{\text{Hours Open}}{168} \times 100\right)$. Zeroed upon issue resolution.

Priority Tiers:
- **Critical**: Score $\ge 80.0$
- **High**: Score $60.0 - 79.9$
- **Medium**: Score $35.0 - 59.9$
- **Low**: Score $< 35.0$

Every score produces a human-readable factor breakdown visible to administrative supervisors.

---

## 4. AI Pattern Detection & Operational Recommendations

The backend engine performs real statistical aggregation across database records to detect infrastructure anomalies:
1. **Garbage Overflow Hotspots**: $\ge 3$ reports in the same sector within 14 days $\rightarrow$ Recommends auxiliary 1.1m³ dumper bin installation and scheduling earlier morning collection sweeps.
2. **Pothole & Surface Damage Clusters**: $\ge 2$ reports concentrated in a road segment $\rightarrow$ Recommends unified asphalt cold-mix patching work orders and roadside stormwater drain desilting.
3. **Prolonged Streetlight Blackouts**: Outages unresolved for $> 72$ hours $\rightarrow$ Escalates to Electrical Maintenance Division for feeder pillar inspection and phase balancing.
4. **Duplicate Complaint Identification**: Submissions matching category and locality within 48 hours are correlated to prevent redundant crew dispatch.

---

## 5. Quick Start (Run Locally)

### A. Clone & Setup Backend
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Start FastAPI server (auto-seeds demo records if DB is empty)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*API Base: `http://localhost:8000/api` | Swagger Docs: `http://localhost:8000/docs`*

### B. Setup & Run Frontend
```bash
cd frontend
npm install
cp .env.example .env

npm run dev
```
*Web App: `http://localhost:5173/`*

---

## 6. Seed Credentials for Immediate Evaluation

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@urbanpulse.ai` | `AdminPassword123!` | Triage, assignment, internal notes, resolution, AI insights, CSV export |
| **Citizen** | `citizen@example.com` | `CitizenPassword123!` | Submit complaints, view personal reports, status tracking |
| **Citizen 2** | `priya.patel@example.com` | `CitizenPassword123!` | Submissions in Bhayandar & Kanakia |

*(The login page features 1-click quick-fill buttons for both Demo Citizen and Demo Admin).*

---

## 7. Running Verification Tests

```bash
# Run Backend Test Suite (Pytest)
cd backend
.\venv\Scripts\pytest

# Run Frontend Test Suite (Vitest)
cd frontend
npm run test

# Run Production Build Check (TypeScript + Vite)
cd frontend
npm run build
```

---

## 8. Docker Support

To run the entire full-stack application with MongoDB containerization:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- MongoDB: `mongodb://localhost:27017`
