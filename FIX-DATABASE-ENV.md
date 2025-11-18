# 🔴 CRITICAL: Database Environment Variable Name

## ❌ Problem

The API is returning 500 errors because the database connection string is NOT being read.

## ✅ Root Cause

The config uses `env_prefix="DB_"`, so it expects:
- **`DB_URL`** (NOT `DATABASE_URL`)

But documentation says to use `DATABASE_URL`.

## 🔧 Fix Required

### Set Environment Variable in Vercel:

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add/Update this variable:**
   - **Key:** `DB_URL`
   - **Value:** `postgresql+asyncpg://postgres:1KJibOLhhk7e6t9D@db.mwvyldzcutztjenscbyr.supabase.co:5432/postgres`
   - **Important:** Must use `postgresql+asyncpg://` (not `postgresql://`) for async support
   - **Environments:** All Environments
   - **Sensitive:** ✅ Enable

3. **Also set these if not already set:**
   - `DB_URL`: Your Supabase connection string (with `+asyncpg`)
   - `SECRET_KEY`: Generate a random secret key
   - `APP_ENVIRONMENT`: `production`

4. **Redeploy** after setting variables

## 📝 Correct Connection String Format

The database URL MUST include the `+asyncpg` driver:

```
postgresql+asyncpg://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres
```

**NOT:**
```
postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres
```

## ✅ Verification

After setting `DB_URL` and redeploying:

```bash
curl https://shiny-couscous-tau.vercel.app/api/forms
# Should return: [] (empty array, not 500 error)
```

