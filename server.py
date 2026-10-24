"""
MediMitra Production & Development Server Entrypoint.
Enables running: uvicorn server:app --port 8000
"""

import sys
import os
from pathlib import Path

# Ensure backend directory is in python search path
root_dir = Path(__file__).resolve().parent
backend_dir = root_dir / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Import the core FastAPI application
from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
