# GitHub Secrets Verification Guide

## Required Secrets

Your GitHub Actions workflow needs these secrets to work:

1. **`GH_PAT`** - GitHub Personal Access Token (with `repo` scope)
2. **`JWT_SECRET`** - JWT signing secret (can be any random string)

## Where to Set Secrets

### Option 1: Repository-Level Secrets (Recommended for Testing)

1. Go to your repository on GitHub
2. Click `Settings` → `Secrets and variables` → `Actions`
3. Click `New repository secret`
4. Add:
   - Name: `GH_PAT`, Value: `[your GitHub token]`
   - Name: `JWT_SECRET`, Value: `[any random string]`

### Option 2: Environment-Level Secrets (Current Setup)

Your workflow uses the `github-pages` environment, so secrets must be set there:

1. Go to your repository on GitHub
2. Click `Settings` → `Environments`
3. Click `github-pages` (or create it if it doesn't exist)
4. Click `Add secret`
5. Add:
   - Name: `GH_PAT`, Value: `[your GitHub token]`
   - Name: `JWT_SECRET`, Value: `[any random string]`

## How to Create a GitHub Token

1. Go to GitHub → Your Profile → `Settings`
2. Click `Developer settings` → `Personal access tokens` → `Tokens (classic)`
3. Click `Generate new token (classic)`
4. Give it a name: `GitHub Pages Deployment`
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - Or for public repos: ✅ `public_repo`
6. Click `Generate token`
7. **Copy the token immediately** (you won't see it again)
8. Add it to GitHub Secrets as `GH_PAT`

## How to Generate JWT_SECRET

Run this command in your terminal:

```bash
openssl rand -hex 32
```

Or use any random string generator. This is just used to sign JWT tokens.

## Verification

After setting secrets:

1. Go to `Actions` → Latest workflow run
2. Check the "Build frontend" step
3. The build should complete successfully
4. If you see errors about missing variables, double-check:
   - Secret names match exactly (case-sensitive)
   - Secrets are in the correct location (repository vs environment)
   - Workflow file references the correct secret names

## Troubleshooting

### Secret Not Found

**Error**: `Secret 'GH_PAT' not found`

**Solution**: 
- Verify the secret name matches exactly (case-sensitive)
- Check if you're using environment secrets - they must be in the `github-pages` environment
- Or remove the `environment:` section from the workflow to use repository secrets

### Token Permission Denied

**Error**: `403 Forbidden` or `401 Unauthorized`

**Solution**:
- Verify your token has `repo` scope
- Check if the token has expired
- Create a new token and update the secret

### Variables Show as Undefined

**Error**: Environment variables are `undefined` in the browser

**Solution**:
- Vite replaces `VITE_*` variables at BUILD TIME
- Secrets must be available during the GitHub Actions build
- Re-run the workflow after adding/updating secrets
- Check the build logs to verify variables are set

## Current Workflow Configuration

Your workflow (`.github/workflows/deploy-frontend.yml`) expects:

```yaml
env:
  VITE_GITHUB_OWNER: ${{ github.repository_owner }}  # Auto-set by GitHub
  VITE_GITHUB_REPO: ${{ github.event.repository.name }}  # Auto-set by GitHub
  VITE_GITHUB_TOKEN: ${{ secrets.GH_PAT }}  # Must be set by you
  VITE_JWT_SECRET: ${{ secrets.JWT_SECRET }}  # Must be set by you
```

The `OWNER` and `REPO` are automatically set by GitHub Actions. You only need to set `GH_PAT` and `JWT_SECRET`.

