"""
FinWise ML Service – FastAPI application entry-point.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health, metrics, predict, explain, categorize

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle hook."""
    logger.info("ML Service starting – version %s", settings.MODEL_VERSION)

    # Import services so their __init__ (model loading) runs
    from app.services.classifier import classifier_service
    from app.services.regressor import regressor_service

    if classifier_service.is_loaded and regressor_service.is_loaded:
        logger.info("All models loaded successfully.")
    else:
        logger.warning(
            "Some models are NOT loaded. classifier=%s  regressor=%s",
            classifier_service.is_loaded,
            regressor_service.is_loaded,
        )

    yield  # ── application runs here ──

    logger.info("ML Service shutting down.")


app = FastAPI(
    title="FinWise ML Service",
    description="Machine-learning microservice for the AI Financial Planning Advisor. "
    "Provides behaviour classification and financial forecasting.",
    version=settings.MODEL_VERSION,
    lifespan=lifespan,
)

# CORS – allow all origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────────────────────
app.include_router(predict.router)
app.include_router(metrics.router)
app.include_router(health.router)
app.include_router(explain.router)
app.include_router(categorize.router)


@app.get("/")
async def root():
    """Welcome / version probe."""
    return {
        "message": "Welcome to the FinWise ML Service",
        "version": settings.MODEL_VERSION,
    }
