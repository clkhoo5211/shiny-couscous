"""
Vercel serverless function entry point for FastAPI.
"""
import sys

# Write to stderr (Vercel shows this in logs immediately)
def log(msg):
    print(msg, file=sys.stderr, flush=True)

log("=" * 60)
log("🚀 STARTING VERCEL FUNCTION")
log("=" * 60)

try:
    import os
    from pathlib import Path
    
    log("✅ Imports loaded")
    
    # Get paths
    current_dir = Path(__file__).parent.absolute()
    root_dir = current_dir.parent.absolute()
    backend_dir = root_dir / "backend"
    src_dir = backend_dir / "src"
    
    log(f"📁 Paths:")
    log(f"   Current: {current_dir}")
    log(f"   Root: {root_dir}")
    log(f"   Backend: {backend_dir} (exists: {backend_dir.exists()})")
    log(f"   Src: {src_dir} (exists: {src_dir.exists()})")
    
    # Check root contents
    if root_dir.exists():
        contents = [p.name for p in list(root_dir.iterdir())[:15]]
        log(f"📂 Root has: {contents}")
    
    # Add to path
    if src_dir.exists():
        sys.path.insert(0, str(src_dir))
        log(f"✅ Added src to path")
    else:
        log(f"❌ SRC DIR DOES NOT EXIST!")
        log(f"   Backend code not included in deployment!")
    
    if backend_dir.exists():
        sys.path.insert(0, str(backend_dir))
        log(f"✅ Added backend to path")
    
    if backend_dir.exists():
        os.chdir(str(backend_dir))
        log(f"✅ Changed to backend dir")
    
    log(f"📋 Python path: {sys.path[:5]}")
    
    # Import FastAPI app
    log("🔄 Importing labuan_fsa.main...")
    from labuan_fsa.main import app
    log("✅ Import successful!")
    log(f"✅ App: {type(app)}")
    
except Exception as e:
    log(f"❌ CRITICAL ERROR: {e}")
    import traceback
    for line in traceback.format_exc().split('\n'):
        log(f"   {line}")
    
    # Fallback app
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/")
    @app.get("/health")
    async def error():
        return {
            "status": "error",
            "message": str(e),
            "type": type(e).__name__
        }
    
    log("⚠️  Using fallback FastAPI app")

log("=" * 60)
log("✅ MODULE LOADED - App exported")
log("=" * 60)
