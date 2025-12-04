# Vercel serverless function wrapper for FastAPI
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Change to backend directory for relative imports
os.chdir(backend_path)

from app import app
from mangum import Mangum

# Wrap FastAPI app with Mangum for AWS Lambda/Vercel compatibility
handler = Mangum(app, lifespan="off")

def lambda_handler(event, context):
    return handler(event, context)

