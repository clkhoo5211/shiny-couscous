-- ============================================================
-- Labuan FSA E-Submission System - Database Schema
-- ============================================================
-- Project: Labuan FSA E-Online Submission System
-- Created: 2025-11-17 15:34:58
-- Status: Design Phase
-- Version: 1.0.0
-- Database: PostgreSQL 14+
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search

-- ============================================================
-- TABLES
-- ============================================================

-- ============================================================
-- Table: forms
-- Purpose: Store form definitions with complete schema as JSONB
-- ============================================================
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    schema_data JSONB NOT NULL,  -- Complete form schema JSON
    is_active BOOLEAN DEFAULT true,
    requires_auth BOOLEAN DEFAULT false,  -- Whether form requires authentication
    estimated_time VARCHAR(50),  -- e.g., "30 minutes"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

COMMENT ON TABLE forms IS 'Form definitions with complete schema stored as JSONB';
COMMENT ON COLUMN forms.form_id IS 'Unique form identifier (e.g., form-a, form-b)';
COMMENT ON COLUMN forms.schema_data IS 'Complete form schema JSON for dynamic rendering';

-- ============================================================
-- Table: form_submissions
-- Purpose: Store form submissions with all field values as JSONB
-- ============================================================
CREATE TABLE form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id VARCHAR(100) NOT NULL REFERENCES forms(form_id) ON DELETE RESTRICT,
    submission_id VARCHAR(100) UNIQUE NOT NULL,  -- Human-readable ID: SUB-YYYYMMDD-XXXXXX
    submitted_data JSONB NOT NULL,  -- All form field values
    status VARCHAR(50) NOT NULL DEFAULT 'draft',  -- draft, submitted, reviewing, approved, rejected, cancelled
    submitted_by VARCHAR(255),  -- User email or identifier
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(255),  -- Admin email or identifier
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    requested_info TEXT,  -- If status is 'request-info', list requested information
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_submission_status CHECK (status IN ('draft', 'submitted', 'reviewing', 'approved', 'rejected', 'cancelled'))
);

COMMENT ON TABLE form_submissions IS 'Form submissions with all field values stored as JSONB';
COMMENT ON COLUMN form_submissions.submission_id IS 'Human-readable submission ID (e.g., SUB-20251117-001234)';
COMMENT ON COLUMN form_submissions.submitted_data IS 'All form field values stored as JSONB (dynamic structure)';

-- ============================================================
-- Table: file_uploads
-- Purpose: Store file upload metadata
-- ============================================================
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,  -- Form field name
    file_name VARCHAR(255) NOT NULL,  -- Original file name
    file_path VARCHAR(500) NOT NULL,  -- Storage path
    file_size BIGINT NOT NULL,  -- File size in bytes
    mime_type VARCHAR(100),  -- File MIME type
    storage_location VARCHAR(50) DEFAULT 'local',  -- local, s3, azure, gcp
    storage_url VARCHAR(500),  -- Full URL to file (if cloud storage)
    file_hash VARCHAR(64),  -- SHA-256 hash for integrity verification
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by VARCHAR(255)  -- User email or identifier
);

COMMENT ON TABLE file_uploads IS 'File upload metadata linked to submissions';
COMMENT ON COLUMN file_uploads.storage_location IS 'Storage location: local, s3, azure, gcp';

-- ============================================================
-- Table: form_fields
-- Purpose: Admin management of field definitions
-- ============================================================
CREATE TABLE form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id VARCHAR(100) NOT NULL REFERENCES forms(form_id) ON DELETE CASCADE,
    field_id VARCHAR(100) NOT NULL,  -- Unique field ID within form
    field_type VARCHAR(50) NOT NULL,  -- input-text, select-single, upload-document, etc.
    field_order INTEGER NOT NULL,  -- Display order
    step_id VARCHAR(100),  -- Which step this field belongs to
    section_id VARCHAR(100),  -- Which section this field belongs to
    schema_data JSONB NOT NULL,  -- Field schema (type, label, validation, style, etc.)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(form_id, field_id)
);

COMMENT ON TABLE form_fields IS 'Field definitions for admin management and reporting';
COMMENT ON COLUMN form_fields.schema_data IS 'Field schema JSON (type, label, validation, style, etc.)';

-- ============================================================
-- Table: users (Optional - if authentication required)
-- Purpose: User accounts for authentication
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- bcrypt hash
    full_name VARCHAR(255),
    phone_number VARCHAR(50),
    role VARCHAR(50) DEFAULT 'user',  -- user, admin, reviewer
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,  -- Email verification
    verification_token VARCHAR(255),
    verification_expires_at TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_user_role CHECK (role IN ('user', 'admin', 'reviewer'))
);

COMMENT ON TABLE users IS 'User accounts for authentication (optional)';

-- ============================================================
-- Table: audit_logs
-- Purpose: System audit trail for compliance
-- ============================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type VARCHAR(50) NOT NULL,  -- create, update, delete, review, approve, reject, login, logout
    entity_type VARCHAR(50) NOT NULL,  -- form, submission, user, file
    entity_id VARCHAR(100) NOT NULL,  -- ID of affected entity
    user_id VARCHAR(255),  -- User email or identifier
    user_role VARCHAR(50),  -- user, admin, reviewer
    changes JSONB,  -- Before/after values or change details
    ip_address VARCHAR(45),  -- IPv4 or IPv6
    user_agent TEXT,
    request_method VARCHAR(10),  -- GET, POST, PUT, DELETE
    request_path VARCHAR(500),
    request_body JSONB,  -- Request body (sanitized)
    response_status INTEGER,  -- HTTP status code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE audit_logs IS 'System audit trail for compliance and security';
COMMENT ON COLUMN audit_logs.changes IS 'Before/after values or change details as JSONB';

-- ============================================================
-- Table: form_versions (Optional - for form versioning)
-- Purpose: Track form schema versions
-- ============================================================
CREATE TABLE form_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id VARCHAR(100) NOT NULL REFERENCES forms(form_id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    schema_data JSONB NOT NULL,  -- Schema at this version
    is_active BOOLEAN DEFAULT false,  -- Only one active version per form
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    change_notes TEXT,
    
    UNIQUE(form_id, version)
);

COMMENT ON TABLE form_versions IS 'Form schema version history';
COMMENT ON COLUMN form_versions.change_notes IS 'Notes about changes in this version';

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Forms indexes
CREATE INDEX idx_forms_form_id ON forms(form_id);
CREATE INDEX idx_forms_is_active ON forms(is_active);
CREATE INDEX idx_forms_category ON forms(category);
CREATE INDEX idx_forms_schema_data_gin ON forms USING GIN(schema_data);  -- JSONB GIN index for querying
CREATE INDEX idx_forms_name_trgm ON forms USING GIN(name gin_trgm_ops);  -- Full-text search on name

-- Submissions indexes
CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_submission_id ON form_submissions(submission_id);
CREATE INDEX idx_form_submissions_status ON form_submissions(status);
CREATE INDEX idx_form_submissions_submitted_at ON form_submissions(submitted_at DESC);
CREATE INDEX idx_form_submissions_submitted_by ON form_submissions(submitted_by);
CREATE INDEX idx_form_submissions_reviewed_by ON form_submissions(reviewed_by);
CREATE INDEX idx_form_submissions_data_gin ON form_submissions USING GIN(submitted_data);  -- JSONB GIN index
CREATE INDEX idx_form_submissions_status_submitted_at ON form_submissions(status, submitted_at DESC);  -- Composite index

-- File uploads indexes
CREATE INDEX idx_file_uploads_submission_id ON file_uploads(submission_id);
CREATE INDEX idx_file_uploads_field_name ON file_uploads(field_name);
CREATE INDEX idx_file_uploads_uploaded_at ON file_uploads(uploaded_at DESC);

-- Form fields indexes
CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX idx_form_fields_step_id ON form_fields(step_id);
CREATE INDEX idx_form_fields_field_type ON form_fields(field_type);
CREATE INDEX idx_form_fields_form_id_order ON form_fields(form_id, field_order);  -- Composite index for ordering

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_entity_type_id ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity_type_created_at ON audit_logs(entity_type, created_at DESC);  -- Composite index

-- Form versions indexes
CREATE INDEX idx_form_versions_form_id ON form_versions(form_id);
CREATE INDEX idx_form_versions_form_id_version ON form_versions(form_id, version);
CREATE INDEX idx_form_versions_is_active ON form_versions(is_active);

-- ============================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to forms table
CREATE TRIGGER update_forms_updated_at
    BEFORE UPDATE ON forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to form_submissions table
CREATE TRIGGER update_form_submissions_updated_at
    BEFORE UPDATE ON form_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to form_fields table
CREATE TRIGGER update_form_fields_updated_at
    BEFORE UPDATE ON form_fields
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FUNCTIONS FOR SUBMISSION ID GENERATION
-- ============================================================

-- Function to generate submission ID: SUB-YYYYMMDD-XXXXXX
CREATE OR REPLACE FUNCTION generate_submission_id()
RETURNS VARCHAR(100) AS $$
DECLARE
    date_prefix VARCHAR(10);
    random_suffix VARCHAR(6);
    submission_id VARCHAR(100);
    exists_check INTEGER;
BEGIN
    date_prefix := 'SUB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
    
    LOOP
        -- Generate 6-digit random number
        random_suffix := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        submission_id := date_prefix || random_suffix;
        
        -- Check if submission ID already exists
        SELECT COUNT(*) INTO exists_check
        FROM form_submissions
        WHERE form_submissions.submission_id = submission_id;
        
        -- If doesn't exist, return it
        IF exists_check = 0 THEN
            RETURN submission_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_submission_id() IS 'Generate unique submission ID in format SUB-YYYYMMDD-XXXXXX';

-- ============================================================
-- VIEWS FOR REPORTING
-- ============================================================

-- View: Form submissions summary
CREATE OR REPLACE VIEW form_submissions_summary AS
SELECT 
    f.form_id,
    f.name AS form_name,
    COUNT(DISTINCT fs.id) AS total_submissions,
    COUNT(DISTINCT CASE WHEN fs.status = 'draft' THEN fs.id END) AS draft_count,
    COUNT(DISTINCT CASE WHEN fs.status = 'submitted' THEN fs.id END) AS submitted_count,
    COUNT(DISTINCT CASE WHEN fs.status = 'reviewing' THEN fs.id END) AS reviewing_count,
    COUNT(DISTINCT CASE WHEN fs.status = 'approved' THEN fs.id END) AS approved_count,
    COUNT(DISTINCT CASE WHEN fs.status = 'rejected' THEN fs.id END) AS rejected_count,
    MAX(fs.submitted_at) AS latest_submission
FROM forms f
LEFT JOIN form_submissions fs ON f.form_id = fs.form_id
GROUP BY f.form_id, f.name;

COMMENT ON VIEW form_submissions_summary IS 'Summary statistics for each form';

-- View: Daily submission statistics
CREATE OR REPLACE VIEW daily_submission_stats AS
SELECT 
    DATE(fs.submitted_at) AS submission_date,
    fs.form_id,
    f.name AS form_name,
    COUNT(*) AS submission_count,
    COUNT(CASE WHEN fs.status = 'approved' THEN 1 END) AS approved_count,
    COUNT(CASE WHEN fs.status = 'rejected' THEN 1 END) AS rejected_count
FROM form_submissions fs
JOIN forms f ON fs.form_id = f.form_id
WHERE fs.submitted_at IS NOT NULL
GROUP BY DATE(fs.submitted_at), fs.form_id, f.name
ORDER BY submission_date DESC, fs.form_id;

COMMENT ON VIEW daily_submission_stats IS 'Daily submission statistics by form';

-- ============================================================
-- CONSTRAINTS AND VALIDATIONS
-- ============================================================

-- Ensure only one active version per form
CREATE OR REPLACE FUNCTION ensure_single_active_version()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = true THEN
        UPDATE form_versions
        SET is_active = false
        WHERE form_id = NEW.form_id
        AND id != NEW.id
        AND is_active = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_active_version_trigger
    BEFORE INSERT OR UPDATE ON form_versions
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_active_version();

-- ============================================================
-- INITIAL DATA / SEED DATA (Optional)
-- ============================================================

-- Example: Insert a sample form (for testing)
-- INSERT INTO forms (form_id, name, description, version, schema_data, is_active)
-- VALUES (
--     'form-sample',
--     'Sample Form',
--     'This is a sample form for testing',
--     '1.0.0',
--     '{"formId": "form-sample", "steps": []}'::jsonb,
--     true
-- );

-- ============================================================
-- GRANTS AND PERMISSIONS (Adjust based on your setup)
-- ============================================================

-- Grant permissions to application user (replace 'app_user' with your actual user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ============================================================
-- END OF SCHEMA
-- ============================================================

