# Local Development Setup Guide

This guide explains how to set up and run the Labuan FSA E-Submission System locally for development.

## Prerequisites

- **Node.js 18+** and npm
- **Python 3.11+**
- **uv** (recommended) or pip/venv
- **Git**
- **GitHub Personal Access Token** (for syncing data and GitHub API access)

## Quick Start

### Option 1: Start Both Servers with Auto-Sync (Recommended)

```bash
# Make scripts executable (first time only)
chmod +x scripts/start-servers.sh
chmod +x scripts/sync-github-data.sh

# Set GitHub token for data syncing (optional, but recommended)
export GITHUB_TOKEN=your_github_token_here

# Start both frontend and backend
./scripts/start-servers.sh
```

This will:
1. ✅ Auto-sync latest JSON data from GitHub
2. ✅ Start backend server on http://localhost:8000
3. ✅ Start frontend server on http://localhost:3000

### Option 2: Start Servers Separately

**Terminal 1 - Sync Data & Start Backend:**
```bash
# Sync latest JSON data from GitHub
export GITHUB_TOKEN=your_github_token_here  # Optional
./scripts/sync-github-data.sh

# Start backend
cd backend
uv sync  # or: pip install -e .
uv run uvicorn labuan_fsa.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend

# Create .env.local file (first time only)
cp .env.local.example .env.local
# Edit .env.local with your GitHub token

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

## Environment Variables Setup

### Frontend Environment Variables

Create `frontend/.env.local` file:

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
# Required: GitHub API Configuration
VITE_GITHUB_OWNER=clkhoo5211
VITE_GITHUB_REPO=shiny-couscous
VITE_GITHUB_TOKEN=your_github_token_here

# Required: JWT Secret
VITE_JWT_SECRET=your_jwt_secret_here
```

**Get GitHub Token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (for private repos) or `public_repo` (for public repos)
4. Copy the token and paste it in `.env.local`

**Generate JWT Secret:**
```bash
openssl rand -hex 32
```

### Backend Environment Variables (Optional)

The backend uses TOML configuration files. For local development:

```bash
cd backend
cp config.example.toml config.local.toml
# Edit config.local.toml as needed
```

## Auto-Sync JSON Data from GitHub

The system can automatically pull the latest JSON data files from GitHub before starting development servers.

### Manual Sync

```bash
# Sync data manually
export GITHUB_TOKEN=your_github_token_here  # Optional, but recommended
./scripts/sync-github-data.sh
```

### Auto-Sync on Start

The `start-servers.sh` script automatically syncs data before starting servers. To skip syncing:

```bash
SKIP_SYNC=1 ./scripts/start-servers.sh
```

### What Gets Synced

The following JSON files are synced from `backend/data/` in the GitHub repository:

- `forms.json` - Form definitions
- `users_auth.json` - User authentication data
- `admins_auth.json` - Admin authentication data
- `admin_roles.json` - Admin role definitions
- `submissions.json` - Form submissions
- `sessions.json` - User sessions
- `settings.json` - System settings
- `files.json` - File upload metadata
- `database.json` - Database metadata

## Access URLs

Once servers are running:

- **Frontend (User Interface)**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Mock Credentials

**Admin User:**
- Email: `admin@example.com` or `superadmin@example.com`
- Password: `admin123` or `superadmin123`

**Regular User:**
- Email: `user@example.com`
- Password: `user123`

## Troubleshooting

### GitHub API Rate Limits

If you see rate limit errors:
1. Set `GITHUB_TOKEN` environment variable with a personal access token
2. The token allows higher rate limits (5000 requests/hour vs 60/hour)

### Data Not Syncing

1. Check your GitHub token has `repo` or `public_repo` scope
2. Verify repository name and owner are correct
3. Check network connection
4. Try manual sync: `./scripts/sync-github-data.sh`

### Frontend Can't Connect to GitHub

1. Verify `.env.local` file exists in `frontend/` directory
2. Check `VITE_GITHUB_OWNER`, `VITE_GITHUB_REPO`, and `VITE_GITHUB_TOKEN` are set
3. Restart the dev server after changing `.env.local`

### Backend Not Starting

1. Check Python version: `python3 --version` (should be 3.11+)
2. Install dependencies: `cd backend && uv sync`
3. Check `config.local.toml` exists
4. Check logs: `tail -f /tmp/backend.log`

## Development Workflow

1. **Pull latest code**: `git pull`
2. **Sync latest data**: `./scripts/sync-github-data.sh` (or auto-sync on start)
3. **Start servers**: `./scripts/start-servers.sh`
4. **Make changes**: Edit code in `frontend/src/` or `backend/src/`
5. **Test changes**: Servers auto-reload on file changes
6. **Commit changes**: `git add . && git commit -m "message" && git push`

## Notes

- The frontend uses GitHub API directly (no backend API needed for data)
- The backend data directory is synced from GitHub for local development
- Changes made locally to JSON files will be overwritten on next sync
- To persist local changes, commit them to GitHub first

