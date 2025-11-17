# 🚀 Start Development Servers

## Quick Start Commands

### Backend (Terminal 1)
```bash
cd backend
source venv/bin/activate
python3 -m uvicorn labuan_fsa.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend (Terminal 2)  
```bash
cd frontend
npm run dev
```

## Access URLs

- **Frontend**: http://localhost:3000 ✅
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Mock User Credentials

**Admin**: admin@labuanfsa.gov.my / admin123
**User**: user@example.com / user123

## Troubleshooting

If backend doesn't start:
1. Ensure PostgreSQL is running
2. Create database: `psql -U postgres -c "CREATE DATABASE labuan_fsa;"`
3. Seed mock users: `cd backend && source venv/bin/activate && python3 scripts/seed_mock_users.py`
4. Check config: `backend/config.local.toml` (database URL)
