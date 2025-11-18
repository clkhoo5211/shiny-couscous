# 🔍 Check Why Auto-Deploy Isn't Working

## ⚡ I Just Triggered an Empty Commit

I just pushed an empty commit to force trigger the webhook. This should make Vercel deploy in 1-2 minutes.

## 🔍 Check These Settings in Vercel

### Step 1: Check Git Integration
1. Vercel Dashboard → Your Project → **Settings** → **Git**
2. Verify:
   - ✅ Repository: `clkhoo5211/shiny-couscous`
   - ✅ Production Branch: `main`
   - ✅ Auto-deploy: **Enabled** ✅
   - ✅ Root Directory: `/` or empty

### Step 2: Check GitHub Webhook
1. GitHub → Your Repo → **Settings** → **Webhooks**
2. Look for Vercel webhook
3. Click on it to see:
   - Recent deliveries
   - If it's firing (green checkmarks)
   - Any errors (red X)

### Step 3: Check Deployment Queue
1. Vercel Dashboard → **Deployments** tab
2. Look for:
   - Any "Queued" deployments
   - Any "Building" deployments
   - If one is stuck, cancel and redeploy

## ⚡ Quick Fix: Check Deployment Status

**Right now:**
1. Go to Vercel Dashboard → **Deployments**
2. **Look at the TOP** - is there a new deployment?
3. If YES: Wait for it to finish
4. If NO: The webhook isn't firing - check Step 2 above

## 🚀 Manual Deploy Script

I created `FORCE-DEPLOY.sh` - run it to trigger deployment:
```bash
./FORCE-DEPLOY.sh
```

Or manually:
```bash
git commit --allow-empty -m "Trigger deploy"
git push origin main
```

## 📋 After Deployment Appears

Once deployment shows up:
1. Wait for it to complete
2. Check **Runtime Logs** for debug output
3. Test: `https://shiny-couscous-tau.vercel.app/health`

**Check the Deployments tab NOW - empty commit should trigger it!**

