# Registration Fix Summary

## Problem Identified

Registration was failing because:
1. Error messages weren't showing the actual problem
2. GitHub client initialization errors were being swallowed
3. Missing environment variables weren't clearly reported

## Changes Made

### 1. Improved Error Handling

**File**: `frontend/src/api/github-client.ts`
- Added detailed error messages showing which environment variables are missing
- Better error reporting with console logging

**File**: `frontend/src/lib/github-auth.ts`
- Added error handling for GitHub client initialization
- Better error messages for GitHub API errors (401, 403, 404)
- Handle missing auth files gracefully
- Added console logging for debugging

### 2. Documentation

Created troubleshooting guides:
- `TROUBLESHOOTING_REGISTRATION.md` - Step-by-step troubleshooting
- `GITHUB_SECRETS_VERIFICATION.md` - How to set up secrets correctly

## What You Need to Check

### Step 1: Verify Secrets Location

Your workflow uses the `github-pages` environment, so secrets must be in **Environment Secrets**, not Repository Secrets:

1. Go to: `https://github.com/clkhoo5211/shiny-couscous/settings/environments`
2. Click on `github-pages` environment
3. Verify these secrets exist:
   - `GH_PAT` (GitHub Personal Access Token)
   - `JWT_SECRET` (JWT signing secret)

### Step 2: Alternative - Use Repository Secrets

If you prefer to use Repository Secrets (easier), update the workflow:

1. Edit `.github/workflows/deploy-frontend.yml`
2. Remove or comment out lines 21-23:
   ```yaml
   # environment:
   #   name: github-pages
   #   url: ${{ steps.deployment.outputs.page_url }}
   ```
3. Set secrets in: `Settings → Secrets and variables → Actions → Repository secrets`

### Step 3: Verify Token Permissions

Your `GH_PAT` token needs:
- `repo` scope (for private repos)
- Or `public_repo` scope (for public repos)

### Step 4: Check Auth Files Exist

Ensure these files exist in your repository:
- `backend/data/users_auth.json`
- `backend/data/admins_auth.json`

If they don't exist, create them with empty arrays:
```json
{
  "users": []
}
```

## Testing After Fix

1. Wait for GitHub Actions to complete the deployment
2. Go to: `https://clkhoo5211.github.io/shiny-couscous/register`
3. Open browser DevTools (F12) → Console tab
4. Try to register
5. Check the console for detailed error messages

The new error messages will tell you exactly what's wrong:
- "GitHub configuration missing: VITE_GITHUB_TOKEN" → Secret not set
- "GitHub authentication failed" → Token invalid or expired
- "GitHub access denied" → Token missing permissions
- "Authentication file not found" → Auth files don't exist in repo

## Next Steps

1. **Check secrets location** (Environment vs Repository)
2. **Verify token permissions** (repo scope)
3. **Re-run workflow** after fixing secrets
4. **Test registration** and check console for detailed errors

## Quick Fix Option

If you want to use Repository Secrets instead of Environment Secrets:

1. Remove the `environment:` section from the workflow
2. Set secrets in Repository Secrets
3. Commit and push

This is simpler and works the same way.

