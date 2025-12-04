from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from pathlib import Path

from core.db import init_db
from routers import auth, users, recyclers, admin, reports, ml, analytics

app = FastAPI(title="E-Waste Management & Recycling Portal")

# CORS: allow local dev frontends and production domains
import os
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://frontend-1zvutl72t-abhinav-gaddes-projects.vercel.app",
    "https://frontend-abhinav-gaddes-projects.vercel.app",
]
# Add Vercel domain if set
vercel_url = os.getenv("VERCEL_URL")
if vercel_url:
    origins.append(f"https://{vercel_url}")
# Add any custom frontend URL
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)
# Allow all origins for now (restrict in production if needed)
origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if "*" not in origins else ["*"],
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


