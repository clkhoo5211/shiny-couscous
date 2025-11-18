# 🌱 Seed Production Database

## ❌ Problem

The `seed_sample_form.py` script runs locally against SQLite, but the production database (Supabase) is empty - no forms exist.

## ✅ Solution: Run Seed Script Against Production Database

### Option 1: Run Locally with Production DATABASE_URL

```bash
cd backend

# Set production DATABASE_URL
export DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Run seed script
uv run python scripts/seed_sample_form.py
```

**Note:** Replace `[PROJECT-REF]`, `[PASSWORD]`, and `[REGION]` with your actual Supabase values from the Transaction Pooler connection string.

### Option 2: Create API Endpoint to Seed (Temporary)

Add a temporary admin endpoint to seed the database via API:

```python
# In backend/src/labuan_fsa/api/admin.py
@router.post("/seed-sample-form")
async def seed_sample_form_endpoint(
    db: AsyncSession = Depends(get_db),
    # Add admin auth check here
):
    """Temporary endpoint to seed sample form in production."""
    from scripts.seed_sample_form import create_sample_form
    await create_sample_form()
    return {"status": "success", "message": "Sample form created"}
```

Then call: `POST https://shiny-couscous-tau.vercel.app/api/admin/seed-sample-form`

### Option 3: Use Vercel CLI to Run Script

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Link to your project
vercel link

# Run script in Vercel environment
vercel env pull .env.production
export $(cat .env.production | xargs)
cd backend
uv run python scripts/seed_sample_form.py
```

## 🔍 Verify Forms Were Created

After seeding:

```bash
# Check if form exists
curl https://shiny-couscous-tau.vercel.app/api/forms

# Should return:
[
  {
    "formId": "labuan-company-management-license",
    "name": "Application for Licence to Carry on Labuan Company Management Business",
    ...
  }
]
```

## 📝 Notes

- **Local vs Production**: Seed script runs against local SQLite by default
- **Production Database**: Needs production DATABASE_URL to seed Supabase
- **One-Time Operation**: Usually only need to run once after deployment
- **Admin Access**: Consider protecting seed endpoint with admin authentication

