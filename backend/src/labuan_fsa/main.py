"""
Labuan FSA E-Submission System - FastAPI Application

Main application entry point for the backend API.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from labuan_fsa.config import get_settings
from labuan_fsa.database import close_db, init_db

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.

    Handles startup and shutdown events.
    """
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


# Create FastAPI app
app = FastAPI(
    title=settings.app.name,
    version=settings.app.version,
    description="Labuan FSA E-Submission System Backend API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware (configure in production)
if settings.app.environment == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*.labuanfsa.gov.my", "labuanfsa.gov.my"],
    )


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {
        "name": settings.app.name,
        "version": settings.app.version,
        "status": "running",
    }


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}


# Include routers
from labuan_fsa.api import forms, submissions

app.include_router(forms.router)
app.include_router(submissions.router)

# TODO: Implement and include remaining routers
# from labuan_fsa.api import files, admin, auth
# app.include_router(files.router, prefix="/api/files", tags=["Files"])
# app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
# app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "labuan_fsa.main:app",
        host=settings.server.host,
        port=settings.server.port,
        reload=settings.server.reload,
    )

