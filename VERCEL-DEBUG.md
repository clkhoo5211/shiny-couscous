# Vercel Deployment Debugging Guide

## Current Status
- **URL**: https://shiny-couscous-tau.vercel.app/
- **Status**: 500 Internal Server Error (FUNCTION_INVOCATION_FAILED)
- **Entry Point**: `api/index.py` at root

## Configuration Files
- `vercel.json` - Root-level Vercel configuration
- `api/index.py` - Vercel serverless function entry point
- `backend/requirements.txt` - Python dependencies

## Debug Steps

### 1. Check Vercel Logs
Go to Vercel Dashboard → Your Project → Deployments → Latest Deployment → Functions Tab

Look for:
- Import errors
- Path resolution issues
- Database connection errors
- Configuration loading errors

### 2. Verify File Structure
Vercel expects:
```
/api/index.py          ← Entry point
/backend/
  /src/
    /labuan_fsa/
      main.py          ← FastAPI app
  requirements.txt     ← Dependencies
vercel.json           ← Configuration
```

### 3. Check Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
- `DATABASE_URL` - Supabase connection string
- `SECRET_KEY` - App secret key
- `ENVIRONMENT` - Should be "production"
- `CORS_ORIGINS` - Allowed origins

### 4. Common Issues

#### Issue: Import Error
**Symptom**: `ModuleNotFoundError: No module named 'labuan_fsa'`
**Fix**: Check path resolution in `api/index.py`

#### Issue: Database Connection
**Symptom**: `ConnectionError` or database initialization failure
**Fix**: 
- Verify `DATABASE_URL` environment variable
- Check Supabase connection string format
- Ensure database is accessible from Vercel's IP range

#### Issue: Configuration Loading
**Symptom**: `FileNotFoundError: config.local.toml`
**Fix**: Configuration should use environment variables in production, not TOML files

### 5. Test Locally
```bash
# Test the entry point locally
cd api
python index.py
```

### 6. Vercel Function Logs
The debug output in `api/index.py` will print:
- Current directory
- Path resolution attempts
- Import status
- Error details

These logs appear in Vercel's function logs.

## Next Steps
1. Check Vercel deployment logs for the debug output
2. Verify environment variables are set correctly
3. Test database connection separately
4. Consider using Vercel's Python runtime directly instead of Mangum

