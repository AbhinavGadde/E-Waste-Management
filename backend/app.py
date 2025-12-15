from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from pathlib import Path
from dotenv import load_dotenv
import os

# Load environment variables from .env file (for local development)
# Get the directory where this file is located
backend_dir = Path(__file__).parent
env_path = backend_dir / ".env"
load_dotenv(dotenv_path=env_path)

from core.db import init_db
from routers import auth, users, recyclers, admin, reports, ml, analytics

app = FastAPI(title="E-Waste Management & Recycling Portal")

# CORS: allow local dev frontends

app.add_middleware(
    CORSMiddleware,
    allow_origins = [
        "https://e-waste-management-sooty.vercel.app"
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


# Static for uploaded images
# Ensure uploads directory exists before mounting
Path("uploads").mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(recyclers.router, prefix="/recyclers", tags=["Recyclers"])
app.include_router(reports.router, prefix="/reports", tags=["Reports"])
app.include_router(ml.router, prefix="/ml", tags=["ML"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])


@app.get("/", tags=["Health"])
def root() -> dict:
    return {"status": "ok"}


