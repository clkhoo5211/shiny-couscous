"""
Vercel serverless function entry point for FastAPI.
"""
import sys
import os
from pathlib import Path

# Get the directory containing this file (backend/api/ or api/)
current_dir = Path(__file__).parent.absolute()

# Try to detect if we're in backend/api/ or api/
# If file is at backend/api/index.py, parent.parent is backend/
# If file is at api/index.py (when deployed), parent is root
if current_dir.name == "api" and current_dir.parent.name == "backend":
    # Local development: backend/api/index.py
    backend_dir = current_dir.parent.absolute()
    src_dir = backend_dir / "src"
else:
    # Vercel deployment: api/index.py (root level)
    # Try to find backend directory
    root_dir = current_dir.parent.absolute()
    backend_dir = root_dir / "backend"
    src_dir = backend_dir / "src"
    
    # If backend doesn't exist, we're probably deployed and files are flattened
    # In Vercel, the structure might be different
    if not backend_dir.exists():
        # Assume src is at root/src for deployed structure
        src_dir = root_dir / "src"

# Add src to Python path so we can import labuan_fsa
if str(src_dir) not in sys.path and src_dir.exists():
    sys.path.insert(0, str(src_dir))

# Add backend directory to path for imports
if str(backend_dir) not in sys.path and backend_dir.exists():
    sys.path.insert(0, str(backend_dir))

# Change working directory to backend if it exists, else root
if backend_dir.exists():
    os.chdir(str(backend_dir))
else:
    os.chdir(str(current_dir.parent.absolute()))

try:
    from labuan_fsa.main import app
except ImportError as e:
    # Try alternative paths
    print(f"⚠️  Import error: {e}")
    print(f"   Python path: {sys.path}")
    print(f"   Current dir: {os.getcwd()}")
    print(f"   Looking for src_dir: {src_dir}")
    print(f"   Backend dir exists: {backend_dir.exists() if backend_dir else False}")
    print(f"   Src dir exists: {src_dir.exists() if src_dir else False}")
    
    # Try adding root/src if backend/src doesn't work
    root_dir = current_dir.parent.parent.absolute()  # Go up two levels from api/
    alt_src_dir = root_dir / "backend" / "src"
    if alt_src_dir.exists() and str(alt_src_dir) not in sys.path:
        print(f"   Trying alternative src_dir: {alt_src_dir}")
        sys.path.insert(0, str(alt_src_dir))
        from labuan_fsa.main import app
    else:
        raise

# Export the FastAPI app for Vercel
# This file must be named index.py and placed in api/ directory
__all__ = ["app"]

