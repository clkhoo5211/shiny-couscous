# Vercel Environment Variables - Exact Values

Use these **EXACT** values in your Vercel Environment Variables page:

## 🔑 Required Environment Variables

### 1. DATABASE_URL
**Key:** `DATABASE_URL`

**Value:** `<YOUR_SUPABASE_CONNECTION_STRING>`
   - Get this from: Supabase Dashboard → Settings → Database → Connection string (URI)
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - **For better performance with Vercel serverless, use connection pooling URL (port 6543) instead**

**Environments:** ✅ All Environments
**Sensitive:** ✅ Enable (toggle ON)

---

### 2. SECRET_KEY
**Key:** `SECRET_KEY`

**Value:** `<GENERATE_NEW_SECRET_KEY>`
   - Generate with: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`
   - Or use any random 32+ character string

**Environments:** ✅ All Environments
**Sensitive:** ✅ Enable (toggle ON)

---

### 3. ENVIRONMENT
**Key:** `ENVIRONMENT`

**Value:** `production`

**Environments:** ✅ All Environments
**Sensitive:** ❌ Disabled (can be public)

---

### 4. CORS_ORIGINS
**Key:** `CORS_ORIGINS`

**Value:** `https://clkhoo5211.github.io`

**Environments:** ✅ All Environments
**Sensitive:** ❌ Disabled (can be public)

---

### 5. PYTHON_VERSION
**Key:** `PYTHON_VERSION`

**Value:** `3.11`

**Environments:** ✅ All Environments
**Sensitive:** ❌ Disabled (can be public)

---

## 📝 Step-by-Step in Vercel UI

1. **Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

2. **For each variable above:**
   - Click "Add Another" or use the empty row
   - Enter the **Key** (exact name)
   - Enter the **Value** (exact value)
   - Select "All Environments" from dropdown
   - Toggle "Sensitive" ON for DATABASE_URL and SECRET_KEY
   - Toggle "Sensitive" OFF for others

3. **After adding all 5 variables:**
   - Click "Save" button

4. **Redeploy:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

## 🔗 Connection Pooling URL (Better for Vercel)

For better performance with Vercel serverless functions, get the connection pooling URL:

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Under **Connection string**, select **URI**
5. Look for **Connection pooling** section
6. Copy the connection string (port 6543)
7. Replace `DATABASE_URL` value with this pooling URL

**Example pooling URL format:**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

## ✅ Verification

After setting variables and redeploying:

1. Visit: `https://your-app.vercel.app/health`
   - Should return: `{"status": "healthy"}`

2. Visit: `https://your-app.vercel.app/docs`
   - Should show FastAPI Swagger UI

3. Test database connection:
   - Visit: `https://your-app.vercel.app/api/forms`
   - Should return forms (may be empty array initially)

