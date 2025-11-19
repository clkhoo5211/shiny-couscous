# Forms Not Loading on GitHub Pages

## Issue

Forms page shows "No forms found" on GitHub Pages deployment (https://clkhoo5211.github.io/shiny-couscous/admin/forms).

## Root Cause

The frontend is trying to use the backend API fallback (which defaults to `http://localhost:8000`) because GitHub API credentials are not configured in the GitHub Actions workflow environment variables.

## Solution

GitHub Pages deployment **requires** GitHub API credentials to be set in the GitHub Actions workflow. The backend API fallback only works for local development.

### Steps to Fix

1. **Verify GitHub Secrets are Set**:
   - Go to: https://github.com/clkhoo5211/shiny-couscous/settings/secrets/actions
   - Ensure these secrets exist:
     - `GH_PAT` - GitHub Personal Access Token
     - `VITE_GITHUB_OWNER` - Repository owner (should be `clkhoo5211`)
     - `VITE_GITHUB_REPO` - Repository name (should be `shiny-couscous`)
     - `VITE_JWT_SECRET` - JWT secret for token generation

2. **Check GitHub Actions Workflow**:
   - Verify `.github/workflows/deploy-frontend.yml` includes these environment variables:
   ```yaml
   env:
     VITE_GITHUB_OWNER: ${{ secrets.VITE_GITHUB_OWNER }}
     VITE_GITHUB_REPO: ${{ secrets.VITE_GITHUB_REPO }}
     VITE_GITHUB_TOKEN: ${{ secrets.GH_PAT }}
     VITE_JWT_SECRET: ${{ secrets.VITE_JWT_SECRET }}
   ```

3. **Redeploy**:
   - Push a commit or manually trigger the workflow
   - Wait for deployment to complete

## Why This Happens

The frontend code checks `isGitHubConfigured()`:
- **If GitHub credentials are set**: Uses GitHub API directly ✅
- **If GitHub credentials are NOT set**: Falls back to backend API (localhost:8000) ❌

On GitHub Pages, there's no backend server, so the fallback fails and forms can't be loaded.

## Verification

After fixing, check the browser console on GitHub Pages:
- Should see GitHub API calls to `api.github.com`
- Should NOT see calls to `localhost:8000`
- Forms should load correctly

## Alternative: Use Environment Secrets

If you prefer to use GitHub's environment secrets feature:
1. Create an environment in repository settings
2. Add secrets to that environment
3. Update workflow to reference the environment:
   ```yaml
   environment:
     name: github-pages
   ```

