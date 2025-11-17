# 📊 Labuan FSA E-Submission System - Analytics Data Models

**Project**: Labuan FSA E-Online Submission System  
**Created**: 2025-11-17 15:34:58  
**Status**: Data Phase  
**Version**: 1.0.0

---

## 🎯 ANALYTICS OVERVIEW

**Analytics Type**: Descriptive Analytics, Predictive Analytics (Optional)  
**Data Models**: Dimensional Models (Star Schema), Time-Series Models  
**Reporting**: Real-time Dashboards, Scheduled Reports, Ad-hoc Queries

---

## 📈 ANALYTICS DATA MODELS

### Model 1: Submission Analytics (Fact Table)

**Purpose**: Central fact table for submission analytics

**Schema**:
```sql
CREATE TABLE analytics_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id VARCHAR(100) UNIQUE NOT NULL,
    form_id VARCHAR(100) NOT NULL,
    
    -- Dimensions (FK to dimension tables)
    date_id INTEGER NOT NULL,  -- Date dimension
    form_dim_id UUID NOT NULL,  -- Form dimension
    status_dim_id UUID NOT NULL,  -- Status dimension
    user_dim_id UUID,  -- User dimension (optional)
    
    -- Metrics (Facts)
    field_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,  -- 0.00 to 100.00
    processing_time_minutes INTEGER,  -- Minutes from submitted to reviewed
    has_attachments BOOLEAN DEFAULT false,
    attachment_count INTEGER DEFAULT 0,
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (form_dim_id) REFERENCES analytics_dim_forms(id),
    FOREIGN KEY (status_dim_id) REFERENCES analytics_dim_statuses(id),
    FOREIGN KEY (date_id) REFERENCES analytics_dim_dates(date_id)
);
```

**Indexes**:
```sql
CREATE INDEX idx_analytics_submissions_form_id ON analytics_submissions(form_id);
CREATE INDEX idx_analytics_submissions_date_id ON analytics_submissions(date_id);
CREATE INDEX idx_analytics_submissions_status_id ON analytics_submissions(status_dim_id);
CREATE INDEX idx_analytics_submissions_submitted_at ON analytics_submissions(submitted_at DESC);
```

---

### Model 2: Form Dimension (Dimension Table)

**Purpose**: Form dimension for analytics

**Schema**:
```sql
CREATE TABLE analytics_dim_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id VARCHAR(100) UNIQUE NOT NULL,
    form_name VARCHAR(255) NOT NULL,
    form_category VARCHAR(100),
    version VARCHAR(50),
    step_count INTEGER,
    field_count INTEGER,
    estimated_time_minutes INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    
    -- Surrogate key for dimension
    dimension_key INTEGER GENERATED ALWAYS AS IDENTITY
);
```

---

### Model 3: Status Dimension (Dimension Table)

**Purpose**: Status dimension for analytics

**Schema**:
```sql
CREATE TABLE analytics_dim_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status_code VARCHAR(50) UNIQUE NOT NULL,  -- draft, submitted, reviewing, approved, rejected
    status_name VARCHAR(100) NOT NULL,
    status_category VARCHAR(50),  -- pending, completed, rejected
    description TEXT,
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true
);
```

---

### Model 4: Date Dimension (Dimension Table)

**Purpose**: Date dimension for time-series analytics

**Schema**:
```sql
CREATE TABLE analytics_dim_dates (
    date_id INTEGER PRIMARY KEY,  -- YYYYMMDD format (e.g., 20251117)
    date_value DATE NOT NULL UNIQUE,
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL,  -- 1-4
    month INTEGER NOT NULL,  -- 1-12
    week INTEGER NOT NULL,  -- 1-52/53
    day_of_month INTEGER NOT NULL,  -- 1-31
    day_of_week INTEGER NOT NULL,  -- 1-7 (Monday=1)
    day_name VARCHAR(20) NOT NULL,  -- Monday, Tuesday, etc.
    month_name VARCHAR(20) NOT NULL,  -- January, February, etc.
    is_weekend BOOLEAN NOT NULL,
    is_month_end BOOLEAN NOT NULL,
    is_quarter_end BOOLEAN NOT NULL,
    is_year_end BOOLEAN NOT NULL
);

-- Populate date dimension (generate dates for next 10 years)
-- This is typically done via a script or data generation tool
```

---

### Model 5: Daily Submission Statistics (Aggregate Table)

**Purpose**: Pre-aggregated daily statistics for fast reporting

**Schema**:
```sql
CREATE TABLE analytics_daily_submission_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_id INTEGER NOT NULL,
    form_id VARCHAR(100) NOT NULL,
    
    -- Aggregated metrics
    total_submissions INTEGER DEFAULT 0,
    draft_count INTEGER DEFAULT 0,
    submitted_count INTEGER DEFAULT 0,
    reviewing_count INTEGER DEFAULT 0,
    approved_count INTEGER DEFAULT 0,
    rejected_count INTEGER DEFAULT 0,
    
    -- Average metrics
    avg_completion_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_processing_time_minutes INTEGER,
    
    -- Processing metrics
    min_processing_time_minutes INTEGER,
    max_processing_time_minutes INTEGER,
    
    -- File metrics
    total_files_uploaded INTEGER DEFAULT 0,
    total_storage_used_bytes BIGINT DEFAULT 0,
    
    -- Metadata
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(date_id, form_id),
    FOREIGN KEY (date_id) REFERENCES analytics_dim_dates(date_id),
    FOREIGN KEY (form_id) REFERENCES analytics_dim_forms(form_id)
);
```

**Indexes**:
```sql
CREATE INDEX idx_daily_stats_date_id ON analytics_daily_submission_stats(date_id);
CREATE INDEX idx_daily_stats_form_id ON analytics_daily_submission_stats(form_id);
CREATE INDEX idx_daily_stats_date_form ON analytics_daily_submission_stats(date_id, form_id);
```

---

### Model 6: File Upload Statistics (Fact Table)

**Purpose**: File upload analytics

**Schema**:
```sql
CREATE TABLE analytics_file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL,
    submission_id VARCHAR(100) NOT NULL,
    form_id VARCHAR(100) NOT NULL,
    date_id INTEGER NOT NULL,
    
    -- File metrics
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100),
    file_category VARCHAR(50),  -- document, image, other
    storage_location VARCHAR(50),  -- local, s3, azure, gcp
    
    -- Timestamps
    uploaded_at TIMESTAMP WITH TIME ZONE,
    
    FOREIGN KEY (date_id) REFERENCES analytics_dim_dates(date_id)
);
```

---

### Model 7: User Activity Analytics (Fact Table)

**Purpose**: User activity tracking (if authentication enabled)

**Schema**:
```sql
CREATE TABLE analytics_user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    date_id INTEGER NOT NULL,
    form_id VARCHAR(100),
    
    -- Activity metrics
    submissions_count INTEGER DEFAULT 0,
    drafts_count INTEGER DEFAULT 0,
    forms_viewed_count INTEGER DEFAULT 0,
    
    -- Engagement metrics
    avg_session_duration_minutes INTEGER,
    avg_forms_per_session DECIMAL(5,2),
    
    -- Timestamps
    first_activity_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    
    FOREIGN KEY (date_id) REFERENCES analytics_dim_dates(date_id)
);
```

---

## 📊 ANALYTICS QUERIES & REPORTS

### Report 1: Submission Overview Dashboard

**Purpose**: High-level submission statistics

**Query**:
```sql
SELECT 
    d.date_value AS submission_date,
    f.form_name,
    COUNT(DISTINCT s.submission_id) AS total_submissions,
    COUNT(DISTINCT CASE WHEN s.status_dim_id = (SELECT id FROM analytics_dim_statuses WHERE status_code = 'submitted') THEN s.submission_id END) AS submitted,
    COUNT(DISTINCT CASE WHEN s.status_dim_id = (SELECT id FROM analytics_dim_statuses WHERE status_code = 'approved') THEN s.submission_id END) AS approved,
    COUNT(DISTINCT CASE WHEN s.status_dim_id = (SELECT id FROM analytics_dim_statuses WHERE status_code = 'rejected') THEN s.submission_id END) AS rejected,
    AVG(s.completion_rate) AS avg_completion_rate,
    AVG(s.processing_time_minutes) AS avg_processing_time_minutes
FROM analytics_submissions s
JOIN analytics_dim_dates d ON s.date_id = d.date_id
JOIN analytics_dim_forms f ON s.form_dim_id = f.id
WHERE d.date_value >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY d.date_value, f.form_name
ORDER BY d.date_value DESC, f.form_name;
```

---

### Report 2: Form Performance Report

**Purpose**: Compare performance across different forms

**Query**:
```sql
SELECT 
    f.form_name,
    COUNT(DISTINCT s.submission_id) AS total_submissions,
    COUNT(DISTINCT CASE WHEN s.status_dim_id = (SELECT id FROM analytics_dim_statuses WHERE status_code = 'approved') THEN s.submission_id END) AS approved,
    COUNT(DISTINCT CASE WHEN s.status_dim_id = (SELECT id FROM analytics_dim_statuses WHERE status_code = 'rejected') THEN s.submission_id END) AS rejected,
    ROUND(
        COUNT(DISTINCT CASE WHEN s.status_dim_id = (SELECT id FROM analytics_dim_statuses WHERE status_code = 'approved') THEN s.submission_id END)::NUMERIC /
        NULLIF(COUNT(DISTINCT s.submission_id), 0) * 100,
        2
    ) AS approval_rate,
    AVG(s.completion_rate) AS avg_completion_rate,
    AVG(s.processing_time_minutes) AS avg_processing_time_minutes,
    MIN(s.processing_time_minutes) AS min_processing_time,
    MAX(s.processing_time_minutes) AS max_processing_time
FROM analytics_submissions s
JOIN analytics_dim_forms f ON s.form_dim_id = f.id
WHERE s.submitted_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY f.form_name
ORDER BY total_submissions DESC;
```

---

### Report 3: Daily Submission Trends

**Purpose**: Track submission trends over time

**Query**:
```sql
SELECT 
    d.date_value,
    d.day_name,
    SUM(ds.total_submissions) AS total_submissions,
    SUM(ds.submitted_count) AS submitted,
    SUM(ds.approved_count) AS approved,
    SUM(ds.rejected_count) AS rejected,
    AVG(ds.avg_completion_rate) AS avg_completion_rate
FROM analytics_daily_submission_stats ds
JOIN analytics_dim_dates d ON ds.date_id = d.date_id
WHERE d.date_value >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY d.date_value, d.day_name
ORDER BY d.date_value DESC;
```

---

### Report 4: Processing Time Analysis

**Purpose**: Analyze processing times and bottlenecks

**Query**:
```sql
SELECT 
    f.form_name,
    st.status_name,
    COUNT(*) AS count,
    AVG(s.processing_time_minutes) AS avg_processing_time,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY s.processing_time_minutes) AS median_processing_time,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY s.processing_time_minutes) AS p95_processing_time,
    MIN(s.processing_time_minutes) AS min_processing_time,
    MAX(s.processing_time_minutes) AS max_processing_time
FROM analytics_submissions s
JOIN analytics_dim_forms f ON s.form_dim_id = f.id
JOIN analytics_dim_statuses st ON s.status_dim_id = st.id
WHERE s.submitted_at >= CURRENT_DATE - INTERVAL '30 days'
  AND s.processing_time_minutes IS NOT NULL
GROUP BY f.form_name, st.status_name
ORDER BY avg_processing_time DESC;
```

---

### Report 5: File Upload Statistics

**Purpose**: Track file upload patterns and storage usage

**Query**:
```sql
SELECT 
    f.form_name,
    fu.file_category,
    fu.storage_location,
    COUNT(*) AS file_count,
    SUM(fu.file_size_bytes) AS total_size_bytes,
    ROUND(SUM(fu.file_size_bytes) / 1024.0 / 1024.0, 2) AS total_size_mb,
    AVG(fu.file_size_bytes) AS avg_file_size_bytes,
    MIN(fu.file_size_bytes) AS min_file_size,
    MAX(fu.file_size_bytes) AS max_file_size
FROM analytics_file_uploads fu
JOIN analytics_dim_forms f ON fu.form_id = f.form_id
WHERE fu.uploaded_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY f.form_name, fu.file_category, fu.storage_location
ORDER BY total_size_mb DESC;
```

---

## 📈 ANALYTICS DASHBOARDS

### Dashboard 1: Admin Submission Dashboard

**Metrics Displayed**:
- Total Submissions (today, week, month)
- Submission Status Distribution (pie chart)
- Submission Trends (line chart - 30 days)
- Top Forms by Submission Count (bar chart)
- Processing Time Statistics (box plot)
- Recent Submissions Table (last 50)

**Data Refresh**: Real-time (every 30 seconds)

---

### Dashboard 2: Form Performance Dashboard

**Metrics Displayed**:
- Form Comparison (approval rate, processing time, completion rate)
- Form Submission Trends (line chart - 90 days per form)
- Field Completion Analysis (heatmap)
- Processing Time Distribution (histogram)
- Form Usage Statistics (submissions per form)

**Data Refresh**: Hourly

---

### Dashboard 3: Storage & File Upload Dashboard

**Metrics Displayed**:
- Total Storage Used (by storage location)
- File Upload Trends (line chart - 30 days)
- File Type Distribution (pie chart)
- Storage Usage by Form (bar chart)
- File Size Distribution (histogram)

**Data Refresh**: Daily

---

## 🔍 ANALYTICS API ENDPOINTS

### GET /api/analytics/submissions/overview
**Purpose**: Get submission overview statistics

**Response**:
```json
{
  "period": "30d",
  "stats": {
    "total": 1250,
    "submitted": 800,
    "reviewing": 150,
    "approved": 250,
    "rejected": 50,
    "avgCompletionRate": 87.5,
    "avgProcessingTimeMinutes": 45
  },
  "trends": {
    "submissions": [120, 135, 140, ...],  // Daily counts
    "approvalRate": [85.2, 86.1, 87.5, ...]  // Daily approval rates
  }
}
```

---

### GET /api/analytics/forms/performance
**Purpose**: Get form performance comparison

**Response**:
```json
{
  "forms": [
    {
      "formId": "form-a",
      "formName": "Form A: License Application",
      "totalSubmissions": 500,
      "approvalRate": 88.5,
      "avgProcessingTimeMinutes": 42,
      "avgCompletionRate": 90.2
    }
  ]
}
```

---

### GET /api/analytics/storage/usage
**Purpose**: Get storage usage statistics

**Response**:
```json
{
  "totalStorageBytes": 1073741824,
  "totalStorageMB": 1024,
  "totalFiles": 1250,
  "byStorageLocation": {
    "local": {"count": 500, "sizeMB": 400},
    "s3": {"count": 750, "sizeMB": 624}
  },
  "byFileCategory": {
    "document": {"count": 1000, "sizeMB": 800},
    "image": {"count": 250, "sizeMB": 224}
  }
}
```

---

## 📊 ANALYTICS SUMMARY

| Analytics Model | Table/View | Purpose | Update Frequency |
|----------------|-----------|---------|------------------|
| **Submission Analytics** | analytics_submissions | Central fact table | Real-time |
| **Form Dimension** | analytics_dim_forms | Form dimension | Real-time |
| **Status Dimension** | analytics_dim_statuses | Status dimension | Static |
| **Date Dimension** | analytics_dim_dates | Time dimension | Static (pre-populated) |
| **Daily Statistics** | analytics_daily_submission_stats | Pre-aggregated stats | Daily (batch) |
| **File Upload Analytics** | analytics_file_uploads | File upload facts | Real-time |
| **User Activity** | analytics_user_activity | User activity facts | Real-time |

**Total Analytics Models**: 7  
**Fact Tables**: 3 (submissions, file_uploads, user_activity)  
**Dimension Tables**: 3 (forms, statuses, dates)  
**Aggregate Tables**: 1 (daily_submission_stats)

---

**Document Status**: ✅ Complete  
**Next Phase**: Data Governance and Quality  
**Last Updated**: 2025-11-17 15:34:58

