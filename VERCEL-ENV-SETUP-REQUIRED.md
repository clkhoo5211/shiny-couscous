# 🔴 CRITICAL: Vercel Environment Variables Required

## ❌ Current Error

```
{"detail":"[Errno 99] Cannot assign requested address","type":"OSError"}
```

This error means **DATABASE_URL is NOT set in Vercel**, so the API is trying to use a default database URL that doesn't exist.

## ✅ REQUIRED: Set These in Vercel NOW

### 1. DATABASE_URL (MOST CRITICAL)

1. **Go to:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

2. **Add/Update:**
   - **Key:** `DATABASE_URL`
   - **Value:** `postgresql+asyncpg://postgres:1KJibOLhhk7e6t9D@db.mwvyldzcutztjenscbyr.supabase.co:5432/postgres`
   - **Environments:** ✅ All Environments (Production, Preview, Development)
   - **Sensitive:** ✅ Enable (toggle ON)

3. **Alternative (if you have connection pooling URL):**
   ```
   postgresql+asyncpg://postgres.PROJECT-REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
   ```

### 2. SECRET_KEY (For JWT tokens)

1. **Key:** `SECRET_KEY`
2. **Value:** Generate with: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`
   - Or use any random 32+ character string
3. **Environments:** ✅ All Environments
4. **Sensitive:** ✅ Enable

### 3. APP_ENVIRONMENT (Optional but recommended)

1. **Key:** `APP_ENVIRONMENT`
2. **Value:** `production`
3. **Environments:** ✅ All Environments
4. **Sensitive:** ❌ Disabled

## 🚀 After Setting Variables

1. **Redeploy** - Go to Deployments tab → Click "..." on latest → "Redeploy"
   - **IMPORTANT:** Uncheck "Use existing Build Cache" if option appears
   - This forces Vercel to pick up new environment variables

2. **Wait 2-3 minutes** for deployment

3. **Test:**
   ```bash
   curl https://shiny-couscous-tau.vercel.app/api/forms
   # Should return: [] (empty array, not 500 error)
   ```

## ✅ Verification Checklist

After redeploying:

- [ ] `curl https://shiny-couscous-tau.vercel.app/health` → `{"status":"healthy"}`
- [ ] `curl https://shiny-couscous-tau.vercel.app/api/forms` → `[]` (not 500 error)
- [ ] Frontend at `https://clkhoo5211.github.io/shiny-couscous/forms` shows forms list (or "No forms available")

## 📝 Summary

- ✅ **CORS:** FIXED (headers present)
- ✅ **Frontend:** WORKING (routes load)
- ✅ **Error responses:** WORKING (CORS headers on errors)
- ❌ **Database:** NEEDS `DATABASE_URL` in Vercel
- ❌ **API endpoints:** BROKEN (due to missing database URL)

**Once `DATABASE_URL` is set in Vercel and redeployed, everything should work!**

