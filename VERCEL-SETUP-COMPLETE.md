# ✅ Vercel Setup Checklist

## 📋 What You Need to Do NOW

### Step 1: Set Environment Variables in Vercel ✅

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

**Add these 5 variables:**

1. **DATABASE_URL** = `<YOUR_SUPABASE_CONNECTION_STRING>`
   - Get from: Supabase Dashboard → Settings → Database → Connection string (URI)
   - ✅ Sensitive: ON
   - ✅ Environments: All

2. **SECRET_KEY** = `<GENERATE_SECRET_KEY>`
   - Generate with: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`
   - ✅ Sensitive: ON
   - ✅ Environments: All

3. **ENVIRONMENT** = `production`
   - ❌ Sensitive: OFF
   - ✅ Environments: All

4. **CORS_ORIGINS** = `https://clkhoo5211.github.io`
   - ❌ Sensitive: OFF
   - ✅ Environments: All

5. **PYTHON_VERSION** = `3.11`
   - ❌ Sensitive: OFF
   - ✅ Environments: All

**Click "Save"**

---

### Step 2: Redeploy Vercel ✅

After saving environment variables:

1. Go to **Deployments** tab in Vercel
2. Click **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

**Your backend URL will be:** `https://your-project-name.vercel.app`

---

### Step 3: Run Database Migrations ✅

Connect to your Supabase database and run migrations:

```bash
cd /Users/khoo/Downloads/project4/projects/project-20251117-153458-labuan-fsa-e-submission-system/backend

# Set database URL
export DATABASE_URL="<YOUR_SUPABASE_CONNECTION_STRING>"

# Install dependencies
uv sync

# Run migrations
uv run alembic upgrade head

# Seed mock data
uv run python scripts/seed_mock_users.py
uv run python scripts/seed_sample_form.py
```

---

### Step 4: Test Backend ✅

1. **Health Check:**
   ```
   https://your-project-name.vercel.app/health
   ```
   Should return: `{"status": "healthy"}`

2. **API Docs:**
   ```
   https://your-project-name.vercel.app/docs
   ```
   Should show FastAPI Swagger UI

3. **Test Forms Endpoint:**
   ```
   https://your-project-name.vercel.app/api/forms
   ```
   Should return forms list

---

### Step 5: Set GitHub Secret ✅

1. **Get your Vercel URL:**
   - From Vercel dashboard, copy your deployment URL
   - Example: `https://labuan-fsa-backend.vercel.app`

2. **Set GitHub Secret:**
   - Go to: https://github.com/clkhoo5211/shiny-couscous/settings/secrets/actions
   - Click **"New repository secret"**
   - **Name:** `VITE_API_URL`
   - **Value:** Your Vercel URL (e.g., `https://labuan-fsa-backend.vercel.app`)
   - Click **"Add secret"**

---

### Step 6: Enable GitHub Pages ✅

1. Go to: https://github.com/clkhoo5211/shiny-couscous/settings/pages
2. Under **Source**, select **"GitHub Actions"**
3. Click **"Save"**

---

## 🎉 After All Steps Complete

Your deployment will be:
- ✅ **Frontend:** https://clkhoo5211.github.io/shiny-couscous/
- ✅ **Backend:** `https://your-project-name.vercel.app`
- ✅ **Database:** Supabase (your project URL)

## 🐛 Troubleshooting

### Backend returns errors?
- Check Vercel deployment logs
- Verify environment variables are set correctly
- Check database migrations ran successfully

### CORS errors?
- Verify `CORS_ORIGINS` includes `https://clkhoo5211.github.io`
- Check backend logs in Vercel

### Database connection errors?
- Verify `DATABASE_URL` is correct
- Check Supabase database is running
- Ensure migrations have run

---

**Next:** Once Vercel is deployed, share your Vercel URL and we'll configure GitHub! 🚀

