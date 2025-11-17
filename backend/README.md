# Labuan FSA E-Submission System - Backend API

**Version**: 1.0.0  
**Python**: 3.11+  
**Framework**: FastAPI  
**Database**: PostgreSQL 14+

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11 or higher
- PostgreSQL 14 or higher
- Redis (optional, for caching and rate limiting)

### Installation

1. **Create virtual environment**:
```bash
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install package**:
```bash
pip install -e .
# Or install with dev dependencies:
pip install -e ".[dev]"
```

3. **Set up configuration**:
```bash
# Copy example config (if exists)
cp config.example.toml config.local.toml
# Edit config.local.toml with your settings
```

4. **Initialize database**:
```bash
# Run migrations
alembic upgrade head

# Load seed data (if available)
python scripts/seed_data.py
```

5. **Run development server**:
```bash
uvicorn labuan_fsa.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`  
API documentation at `http://localhost:8000/docs`

---

## 📁 Project Structure

```
backend/
├── src/
│   └── labuan_fsa/
│       ├── __init__.py
│       ├── main.py              # FastAPI application entry point
│       ├── config.py            # Configuration management (TOML-based)
│       ├── database.py          # Database connection and session management
│       ├── models/              # SQLAlchemy models
│       │   ├── __init__.py
│       │   ├── form.py
│       │   ├── submission.py
│       │   ├── file_upload.py
│       │   └── user.py
│       ├── schemas/             # Pydantic schemas
│       │   ├── __init__.py
│       │   ├── form.py
│       │   ├── submission.py
│       │   └── auth.py
│       ├── api/                 # API routes
│       │   ├── __init__.py
│       │   ├── forms.py
│       │   ├── submissions.py
│       │   ├── files.py
│       │   ├── admin.py
│       │   └── auth.py
│       ├── services/            # Business logic
│       │   ├── __init__.py
│       │   ├── form_service.py
│       │   ├── submission_service.py
│       │   ├── file_service.py
│       │   └── auth_service.py
│       ├── utils/               # Utilities
│       │   ├── __init__.py
│       │   ├── security.py
│       │   ├── storage.py
│       │   └── validators.py
│       └── integrations/        # External integrations
│           ├── __init__.py
│           ├── storage.py       # S3, Azure, GCP storage
│           ├── email.py         # SendGrid, AWS SES
│           └── secrets.py       # Secrets management
├── alembic/                     # Database migrations
│   ├── versions/
│   └── env.py
├── tests/                       # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/                     # Utility scripts
│   ├── seed_data.py
│   └── create_admin.py
├── config.local.toml            # Local configuration (gitignored)
├── pyproject.toml               # Package configuration
└── README.md                    # This file
```

---

## ⚙️ Configuration

Configuration is managed through TOML files to avoid `.env` file exposure:

### Configuration Files

- `config.local.toml` - Local development settings (gitignored)
- `config.example.toml` - Example configuration template
- Production: Use cloud secrets manager (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager)

### Configuration Structure

```toml
[app]
name = "Labuan FSA E-Submission API"
version = "1.0.0"
debug = false
environment = "development"

[server]
host = "0.0.0.0"
port = 8000
reload = true

[database]
url = "postgresql+asyncpg://user:password@localhost:5432/labuan_fsa"
echo = false
pool_size = 20
max_overflow = 10

[security]
secret_key = "your-secret-key-here"  # Use secrets manager in production
algorithm = "HS256"
access_token_expire_minutes = 30
refresh_token_expire_days = 7

[storage]
provider = "local"  # local, s3, azure, gcp
local_path = "./uploads"
s3_bucket = ""
s3_region = ""
azure_account_name = ""
azure_container = ""
gcp_bucket = ""

[secrets_manager]
provider = "local"  # local, aws, azure, gcp
aws_region = ""
azure_vault_url = ""
gcp_project_id = ""
```

---

## 🗄️ Database

### Models

- **Form** - Form definitions with JSONB schema
- **FormSubmission** - Submissions with JSONB data
- **FileUpload** - File upload metadata
- **User** - User accounts (optional)
- **AuditLog** - System audit trail
- **FormVersion** - Form schema version history

### Migrations

Migrations are managed with Alembic:

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

---

## 🔐 Authentication

Authentication uses JWT tokens:

1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login` → Returns JWT token
3. **Protected Routes**: Include `Authorization: Bearer <token>` header
4. **Refresh**: `POST /api/auth/refresh`

---

## 📤 File Uploads

File uploads are handled via multipart/form-data:

1. **Upload**: `POST /api/files/upload`
2. Files are stored locally (development) or cloud storage (production)
3. File metadata is stored in `file_uploads` table
4. Files are linked to submissions via `submission_id`

---

## 🧪 Testing

Run tests with pytest:

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=labuan_fsa --cov-report=html

# Run specific test file
pytest tests/test_forms.py
```

---

## 📦 Building Package

Build distributable package:

```bash
# Build wheel
python -m build

# Install from wheel
pip install dist/labuan_fsa_backend-1.0.0-py3-none-any.whl
```

---

## 🚢 Deployment

See `docs/deployment/` for deployment instructions.

---

## 📚 API Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 📝 License

MIT License

