# Local Development Without GitHub Credentials

This guide explains how to run the frontend locally **without** setting GitHub API credentials. The system will automatically use the backend API instead.

## How It Works

The frontend automatically detects if GitHub API credentials are configured:

- **If GitHub credentials are set** (`VITE_GITHUB_OWNER`, `VITE_GITHUB_REPO`, `VITE_GITHUB_TOKEN`): Uses GitHub API directly
- **If GitHub credentials are NOT set**: Automatically falls back to using the backend API (which serves JSON files from `backend/data/`)

## Setup

### 1. Start Backend Server

The backend must be running to serve the JSON data files:

```bash
cd backend
uv sync  # or: pip install -e .
uv run uvicorn labuan_fsa.main:app --host 127.0.0.1 --port 8000 --reload
```

Or use the start script:

```bash
./scripts/start-servers.sh
```

### 2. Start Frontend (No GitHub Credentials Needed)

```bash
cd frontend
npm install
npm run dev
```

**That's it!** No need to create `.env.local` or set any GitHub credentials.

The frontend will automatically:
- Detect that GitHub credentials are missing
- Switch to backend API mode
- Use `http://localhost:8000` (or `VITE_API_URL` if set) for all API calls

## What Gets Used

When GitHub credentials are not set:

- ✅ **Forms API**: Uses `/api/forms` from backend
- ✅ **Submissions API**: Uses `/api/submissions` from backend  
- ✅ **File Uploads**: Uses `/api/files` from backend
- ⚠️ **Authentication**: Still uses GitHub API (requires credentials) OR backend auth endpoints

## Backend API Endpoints

The backend serves JSON data via these endpoints:

- `GET /api/forms` - List all forms
- `GET /api/forms/{formId}` - Get specific form
- `GET /api/forms/{formId}/schema` - Get form schema
- `GET /api/submissions` - List submissions
- `POST /api/submissions` - Create submission
- `GET /api/files` - List files
- `POST /api/files/upload` - Upload file

## Environment Variables (Optional)

If you want to customize the backend URL:

```bash
# In frontend/.env.local (optional)
VITE_API_URL=http://localhost:8000
```

## Benefits

✅ **No credentials needed** - No risk of accidentally committing tokens  
✅ **Faster development** - No GitHub API rate limits  
✅ **Offline capable** - Works without internet connection  
✅ **Easier debugging** - All data in local `backend/data/` directory  

## Limitations

⚠️ **Authentication**: Currently, login/register still use GitHub API. To use backend auth:
- Update `github-auth.ts` to support backend API fallback
- Or use backend's auth endpoints directly

⚠️ **Data Sync**: Local changes won't sync to GitHub automatically. To sync:
- Use `./scripts/sync-github-data.sh` to pull latest data
- Commit changes to GitHub manually

## Troubleshooting

### "No API client available" Error

**Problem**: Frontend can't connect to backend API.

**Solution**:
1. Make sure backend is running: `curl http://localhost:8000/health`
2. Check `VITE_API_URL` is correct (default: `http://localhost:8000`)
3. Check browser console for CORS errors

### Forms Not Loading

**Problem**: Forms API returns 404 or empty data.

**Solution**:
1. Check `backend/data/forms.json` exists and has data
2. Verify backend is serving JSON files correctly
3. Check backend logs for errors

### Authentication Not Working

**Problem**: Login/register fails.

**Solution**:
- Currently, auth still requires GitHub API credentials
- For full backend-only mode, update `github-auth.ts` to use backend API
- Or set GitHub credentials just for auth: `VITE_GITHUB_OWNER`, `VITE_GITHUB_REPO`, `VITE_GITHUB_TOKEN`

## Switching Between Modes

To switch from backend API to GitHub API:

1. Create `frontend/.env.local`:
```env
VITE_GITHUB_OWNER=your_username
VITE_GITHUB_REPO=your_repo
VITE_GITHUB_TOKEN=your_token
```

2. Restart frontend dev server

To switch back to backend API:

1. Remove or comment out GitHub credentials in `.env.local`
2. Restart frontend dev server

