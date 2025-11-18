# 🔍 How to Check Vercel Logs - Step by Step

## ❌ Current Status: 500 Error

Both endpoints are returning 500 errors:
- `https://shiny-couscous-tau.vercel.app/` → 500
- `https://shiny-couscous-tau.vercel.app/health` → 500

**The serverless function is crashing, but we need to see the ACTUAL ERROR to fix it.**

## 📋 Step-by-Step: Check Vercel Logs

### Method 1: Check Runtime Logs (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in if needed

2. **Find Your Project**
   - Look for project: `shiny-couscous`
   - Click on it

3. **Go to Deployments Tab**
   - Click **"Deployments"** in the top navigation
   - You'll see a list of all deployments

4. **Click on Latest Deployment**
   - Click on the deployment at the top of the list
   - This opens the deployment details page

5. **Check Function Logs**
   - Look for tabs: **"Functions"**, **"Runtime Logs"**, or **"Logs"**
   - Click on **"Functions"** tab (or "Runtime Logs")
   - **This shows the actual error messages!**

6. **Look for Error Messages**
   The logs will show:
   - 🔍 Debug output from `api/index.py`
   - ❌ Python error traceback
   - ❌ ImportError, ModuleNotFoundError, etc.

### Method 2: Check Logs Tab (Real-time)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on project: `shiny-couscous`

2. **Click "Logs" Tab**
   - In the top navigation, click **"Logs"**
   - This shows real-time logs

3. **Trigger the Function**
   - In another tab, visit: `https://shiny-couscous-tau.vercel.app/health`
   - This triggers the function

4. **Check Logs Immediately**
   - Switch back to Vercel Logs tab
   - You'll see the error appear in real-time

## 🔍 What to Look For in Logs

### Expected Debug Output (from api/index.py):
```
🔍 Vercel Entry Point Debug:
   Current dir: /var/task/api
   Root dir: /var/task
   Backend dir: /var/task/backend (exists: True/False)
   Src dir: /var/task/backend/src (exists: True/False)
```

### Common Errors to Find:

**1. Missing Dependencies:**
```
ModuleNotFoundError: No module named 'fastapi'
ModuleNotFoundError: No module named 'mangum'
```

**2. Import Error:**
```
ImportError: cannot import name 'app' from 'labuan_fsa.main'
```

**3. Backend Directory Not Found:**
```
⚠️  Warning: backend directory does not exist!
⚠️  Warning: backend/src does not exist!
```

**4. Database Connection Error:**
```
ConnectionError: Database connection failed
```

**5. Handler Export Error:**
```
AttributeError: module 'index' has no attribute 'handler'
```

## 📸 Screenshots to Share

If you can't copy the error, please share:
1. Screenshot of the **Function Logs** tab
2. Screenshot of the **Build Logs** tab (if build failed)
3. Screenshot of the error message

## ⚡ Quick Actions

### If You See the Error:

**Copy the entire error message** including:
- The traceback (all lines)
- The error type (ModuleNotFoundError, ImportError, etc.)
- The file and line number where it failed

**Share it with me**, and I'll provide the exact fix!

### Common Fixes Based on Error:

| Error | Fix |
|-------|-----|
| `ModuleNotFoundError: No module named 'fastapi'` | Dependencies not installing - check `api/requirements.txt` |
| `ImportError: cannot import name 'app'` | Backend code not accessible - check `functions.includeFiles` |
| `backend directory does not exist` | File structure issue - verify files in GitHub |
| `Database connection failed` | Missing `DATABASE_URL` environment variable |
| `AttributeError: module 'index' has no attribute 'handler'` | Handler export issue - check `api/index.py` |

## 🎯 Next Steps

1. ✅ **Check Function Logs** in Vercel Dashboard
2. ✅ **Find the actual error message**
3. ✅ **Copy and share the error** (or screenshot)
4. ✅ **I'll provide the exact fix**

The error message is the key to fixing this! 🔑

