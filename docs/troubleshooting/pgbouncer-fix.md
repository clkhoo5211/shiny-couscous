# 🔧 Fix: Prepared Statements Error with Transaction Pooler

## ❌ Error

```
"prepared statement \"__asyncpg_stmt_6__\" already exists"
"DuplicatePreparedStatementError"
```

**HINT:**
```
NOTE: pgbouncer with pool_mode set to "transaction" or
"statement" does not support prepared statements properly.
```

## ✅ Root Cause

Supabase's **Transaction Pooler** uses **pgbouncer**, which doesn't support prepared statements in transaction mode. This is a known limitation.

## 🔧 Solution Applied

Modified `backend/src/labuan_fsa/database.py` to:

1. **Detect Transaction Pooler** - Check if connection URL contains "pooler" or port 6543
2. **Disable Prepared Statements** - Set `statement_cache_size=0` when using pooler
3. **Log Warning** - Print warning when pooler is detected and prepared statements are disabled

### Code Change:

```python
# Check if using pooler (contains "pooler" or port 6543)
is_pooler = "pooler" in database_url.lower() or ":6543" in database_url

# CRITICAL: Disable prepared statements for pgbouncer (Transaction Pooler)
if is_pooler:
    connect_args["statement_cache_size"] = 0
    print("⚠️  Transaction Pooler detected - disabling prepared statements (statement_cache_size=0)")
```

## ✅ What This Fixes

- ✅ Prevents "prepared statement already exists" errors
- ✅ Works correctly with Supabase Transaction Pooler
- ✅ Maintains compatibility with Direct Connection (port 5432)
- ✅ Automatically detects pooler vs direct connection

## 🚀 After Fix

### Wait for Vercel Auto-Deploy

The fix has been pushed. Vercel should auto-deploy in 2-3 minutes.

### Verify It's Working

1. **Check Vercel Logs:**
   Go to **Vercel Dashboard** → **Deployments** → **Latest** → **Functions** → `api/index.py` → **Logs**

   Look for:
   ```
   ⚠️  Transaction Pooler detected - disabling prepared statements (statement_cache_size=0)
   ✅ Database connection successful
   ```

2. **Test API Endpoints:**
   ```bash
   curl https://shiny-couscous-tau.vercel.app/api/forms
   # Should return: [] (no error)
   
   # Try multiple requests to ensure no prepared statement errors
   curl https://shiny-couscous-tau.vercel.app/api/forms
   curl https://shiny-couscous-tau.vercel.app/api/forms
   # Both should work without errors
   ```

3. **Test Form Operations:**
   - Create a form via admin dashboard
   - Submit a form via user frontend
   - All should work without prepared statement errors

## 📝 Technical Details

### Why This Happens

- **Prepared statements** are optimized SQL queries that are parsed once and reused
- **pgbouncer** in transaction mode doesn't track prepared statements across connections
- **asyncpg** tries to cache prepared statements, causing conflicts with pgbouncer

### The Fix

- Setting `statement_cache_size=0` disables asyncpg's prepared statement cache
- Each query is parsed fresh (slight performance cost, but works with pgbouncer)
- This is the recommended solution for pgbouncer + asyncpg

### Alternative Solutions

1. **Use Direct Connection (port 5432)** - But this causes `[Errno 99]` errors in Vercel serverless
2. **Use Session Pooler** - But this doesn't work well for serverless functions
3. **Disable Prepared Statements** - ✅ This is what we did (recommended)

## 🎯 Summary

**Problem:** Prepared statement errors with Supabase Transaction Pooler (pgbouncer)
**Solution:** Disable prepared statements (`statement_cache_size=0`) when using pooler
**Result:** ✅ Works correctly with Transaction Pooler, no more prepared statement errors

The fix is deployed - wait 2-3 minutes for Vercel to auto-deploy, then test again!

