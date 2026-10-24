"""
MediMitra Backend Server Entrypoint (inside backend/ directory).
Enables running: uvicorn server:app --port 8000
"""

import sys
import os
from pathlib import Path

# Ensure current backend directory is in sys.path
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
