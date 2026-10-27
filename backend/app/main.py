import os
import logging
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import DatabaseManager
from app.api.auth import router as auth_router
from app.api.reports import router as reports_router
from app.api.public import router as public_router
from app.api.admin import router as admin_router
from app.api.analytics import router as analytics_router
from app.api.insights import router as insights_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("urbanpulse")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure DB connected and seed if empty
    logger.info("Initializing UrbanPulse AI backend services...")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    db = DatabaseManager.get_db()
    
    # Check if empty, auto-seed demo data for immediate academic evaluation
    if db.reports.count_documents({}) == 0:
        logger.info("Database is empty. Automatically bootstrapping realistic Mira-Bhayandar demo records...")
        try:
            from scripts.seed_demo import seed_database
            seed_database()
            logger.info("Bootstrapping complete.")
        except Exception as e:
            logger.warning(f"Demo data bootstrap notice: {e}")
            
    yield
    logger.info("UrbanPulse AI backend shutting down.")

app = FastAPI(
    title="UrbanPulse AI API",
    description="Intelligent Smart City Operations Monitoring & Optimization Platform (Mira-Bhayandar Municipal Prototype)",
    version=settings.VERSION,
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for images (both /uploads and /api/uploads)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
app.mount("/api/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="api_uploads")

# Health check
@app.get("/api/health", tags=["System"])
def health_check():
    is_mock = DatabaseManager.is_mock()
    return {
        "status": "healthy",
        "service": "UrbanPulse AI - Operations Core",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database_mode": "in-memory (mongomock demo fallback)" if is_mock else "connected (MongoDB live)",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "academic_notice": "Semester V / IDEA LAB Prototype. Demonstration data active until verified municipal live stream integration.",
    }

# Register API Routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(public_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(insights_router, prefix="/api")
