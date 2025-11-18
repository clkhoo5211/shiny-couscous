"""
Vercel serverless function entry point for FastAPI.

This file is placed at the root api/ directory for Vercel deployment.
It imports the FastAPI app from the backend directory.
"""
import sys
import os
from pathlib import Path

# Critical: Print immediately to ensure we see output
print("=" * 60)
print("🚀 Vercel Function Starting...")
print("=" * 60)

# Get the directory containing this file (api/ at root)
current_dir = Path(__file__).parent.absolute()
# Get root directory (parent of api/)
root_dir = current_dir.parent.absolute()
# Get backend directory (root/backend)
backend_dir = root_dir / "backend"
# Get src directory (backend/src)
src_dir = backend_dir / "src"

# Debug output (will appear in Vercel logs)
print(f"🔍 Vercel Entry Point Debug:")
print(f"   Current dir: {current_dir}")
print(f"   Root dir: {root_dir}")
print(f"   Backend dir: {backend_dir} (exists: {backend_dir.exists()})")
print(f"   Src dir: {src_dir} (exists: {src_dir.exists()})")

# List actual contents to debug
if root_dir.exists():
    print(f"   Root contents: {[p.name for p in root_dir.iterdir()][:10]}")
if current_dir.exists():
    print(f"   Api dir contents: {[p.name for p in current_dir.iterdir()][:10]}")

# Add backend/src to Python path so we can import labuan_fsa
if src_dir.exists():
    if str(src_dir) not in sys.path:
        sys.path.insert(0, str(src_dir))
        print(f"✅ Added {src_dir} to Python path")
else:
    print(f"⚠️  WARNING: {src_dir} does NOT exist!")
    print(f"   This means backend code is not included in deployment!")
    print(f"   Check vercel.json includeFiles configuration")

# Also add backend directory to path for imports
if backend_dir.exists():
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))
        print(f"✅ Added {backend_dir} to Python path")
else:
    print(f"⚠️  WARNING: {backend_dir} does NOT exist!")

# Change working directory to backend if it exists
if backend_dir.exists():
    os.chdir(str(backend_dir))
    print(f"✅ Changed working directory to: {backend_dir}")

# Try to import the FastAPI app
app = None
handler = None

try:
    print(f"🔄 Attempting to import labuan_fsa.main...")
    print(f"   Python path: {sys.path[:5]}...")  # Show first 5 paths
    from labuan_fsa.main import app
    print(f"✅ Successfully imported labuan_fsa.main")
    
    # Vercel serverless function handler
    try:
        from mangum import Mangum
        handler = Mangum(app, lifespan="off")
        print(f"✅ Created Mangum handler")
    except ImportError as e:
        print(f"⚠️  Mangum not available ({e}), using FastAPI app directly")
        handler = app
        print(f"✅ Using FastAPI app as handler")
    
    print(f"✅ Handler ready: {type(handler)}")
    
except ImportError as e:
    print(f"❌ CRITICAL Import error: {e}")
    print(f"   Error type: {type(e).__name__}")
    import traceback
    traceback.print_exc()
    
    # Create fallback handler
    def error_handler(req, res):
        error_msg = str(e)
        res.status(500).send(f'{{"error": "Import failed", "message": "{error_msg}"}}')
    handler = error_handler
    print(f"⚠️  Created error handler as fallback")
    
except Exception as e:
    print(f"❌ CRITICAL Unexpected error: {e}")
    import traceback
    traceback.print_exc()
    
    def error_handler(req, res):
        error_msg = str(e)
        res.status(500).send(f'{{"error": "Initialization failed", "message": "{error_msg}"}}')
    handler = error_handler
    print(f"⚠️  Created error handler as fallback")

# Ensure handler exists
if handler is None:
    print(f"❌ CRITICAL: Handler is None!")
    def fallback_handler(req, res):
        res.status(500).send('{"error": "Handler not initialized"}')
    handler = fallback_handler

print(f"=" * 60)
print(f"✅ Handler exported: {type(handler)}")
print(f"=" * 60)
