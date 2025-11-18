"""
Vercel serverless function entry point for FastAPI.
"""
import sys
from pathlib import Path

# Add backend/src to path so we can import labuan_fsa
backend_path = Path(__file__).parent.parent
src_path = backend_path / "src"
sys.path.insert(0, str(src_path))

from labuan_fsa.main import app

# Export the FastAPI app for Vercel
# This file must be named index.py and placed in api/ directory
__all__ = ["app"]

