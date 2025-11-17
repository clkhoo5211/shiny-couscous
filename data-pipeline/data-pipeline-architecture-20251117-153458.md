# 🔄 Labuan FSA E-Submission System - Data Pipeline Architecture

**Project**: Labuan FSA E-Online Submission System  
**Created**: 2025-11-17 15:34:58  
**Status**: Data Phase  
**Version**: 1.0.0

---

## 🎯 DATA PIPELINE OVERVIEW

**Pipeline Pattern**: ETL (Extract, Transform, Load)  
**Architecture**: Real-time processing with batch analytics  
**Data Sources**: Form submissions, file uploads, audit logs, user interactions

---

## 📊 DATA FLOW ARCHITECTURE

### Overall Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA SOURCES                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Form        │  │ File        │  │ Audit       │             │
│  │ Submissions │  │ Uploads     │  │ Logs        │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 EXTRACT LAYER (Real-time)                           │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database (Primary Storage)                        │ │
│  │  - forms (JSONB schema_data)                                  │ │
│  │  - form_submissions (JSONB submitted_data)                    │ │
│  │  - file_uploads                                               │ │
│  │  - audit_logs (JSONB changes)                                 │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 TRANSFORM LAYER                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Data Validation & Cleansing                                  │ │
│  │  - Validate JSONB structures                                  │ │
│  │  - Sanitize user inputs                                       │ │
│  │  - Normalize field values                                     │ │
│  │  - Extract metadata                                           │ │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Data Enrichment                                              │ │
│  │  - Add timestamps                                             │ │
│  │  - Calculate metrics                                          │ │
│  │  - Derive aggregations                                        │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 LOAD LAYER (Analytics & Reporting)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Analytics    │  │ Reporting    │  │ Real-time    │             │
│  │ Database     │  │ Dashboard    │  │ Metrics      │             │
│  │ (PostgreSQL) │  │ (React)      │  │ (Redis)      │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 DATA PIPELINES

### Pipeline 1: Real-Time Form Submission Processing

**Purpose**: Process form submissions in real-time as they arrive

**Source**: `form_submissions` table (PostgreSQL)  
**Trigger**: INSERT/UPDATE on `form_submissions` table  
**Frequency**: Real-time (triggered on submission)

**Transformations**:
1. **Extract JSONB Data**: Parse `submitted_data` JSONB field
2. **Validate Structure**: Ensure JSONB structure matches form schema
3. **Extract Metadata**: Extract submission metadata (form_id, status, timestamps)
4. **Enrich Data**: Add computed fields (processing_time, completion_rate)
5. **Calculate Metrics**: Count fields completed, calculate form completion percentage

**Destination**: 
- `analytics_submissions` table (denormalized for reporting)
- Real-time metrics cache (Redis)

**Processing Logic**:
```python
def process_submission(submission_id: str):
    # Extract submission data
    submission = get_submission(submission_id)
    form_schema = get_form_schema(submission.form_id)
    
    # Transform JSONB data
    transformed_data = {
        'submission_id': submission.submission_id,
        'form_id': submission.form_id,
        'status': submission.status,
        'submitted_at': submission.submitted_at,
        'field_count': count_fields(submission.submitted_data),
        'completion_rate': calculate_completion_rate(submission.submitted_data, form_schema),
        'processing_time': calculate_processing_time(submission),
        'has_attachments': has_attachments(submission.submission_id)
    }
    
    # Load to analytics database
    save_to_analytics(transformed_data)
    
    # Update real-time metrics
    update_metrics_cache(transformed_data)
```

---

### Pipeline 2: Daily Submission Analytics Aggregation

**Purpose**: Aggregate daily submission statistics for reporting

**Source**: `form_submissions` table (PostgreSQL)  
**Trigger**: Scheduled (daily at 00:00 UTC)  
**Frequency**: Daily batch processing

**Transformations**:
1. **Group by Form**: Aggregate submissions by form_id
2. **Group by Status**: Count submissions by status (submitted, approved, rejected)
3. **Calculate Averages**: Average processing time, completion rate
4. **Time Series Data**: Track trends over time

**Destination**: 
- `daily_submission_stats` view/table
- Analytics dashboard database

**Processing Logic**:
```python
def aggregate_daily_stats(date: str):
    # Query submissions for date
    submissions = get_submissions_by_date(date)
    
    # Group by form
    stats_by_form = {}
    for submission in submissions:
        form_id = submission.form_id
        if form_id not in stats_by_form:
            stats_by_form[form_id] = {
                'form_id': form_id,
                'date': date,
                'total': 0,
                'submitted': 0,
                'approved': 0,
                'rejected': 0,
                'reviewing': 0,
                'avg_processing_time': 0
            }
        
        stats_by_form[form_id]['total'] += 1
        stats_by_form[form_id][submission.status] += 1
    
    # Calculate averages
    for form_id, stats in stats_by_form.items():
        stats['avg_processing_time'] = calculate_avg_processing_time(form_id, date)
    
    # Save to analytics database
    save_daily_stats(list(stats_by_form.values()))
```

---

### Pipeline 3: File Upload Analytics

**Purpose**: Track file upload statistics and storage usage

**Source**: `file_uploads` table (PostgreSQL)  
**Trigger**: Real-time (triggered on file upload)  
**Frequency**: Real-time processing

**Transformations**:
1. **Extract File Metadata**: file_size, mime_type, storage_location
2. **Calculate Storage Usage**: Aggregate file sizes by form, by date
3. **Track Upload Patterns**: Upload frequency, file type distribution

**Destination**: 
- `file_upload_stats` table
- Storage usage dashboard

**Processing Logic**:
```python
def process_file_upload(file_id: str):
    file = get_file_upload(file_id)
    submission = get_submission(file.submission_id)
    
    # Transform file data
    file_stats = {
        'file_id': file_id,
        'submission_id': file.submission_id,
        'form_id': submission.form_id,
        'file_size': file.file_size,
        'mime_type': file.mime_type,
        'storage_location': file.storage_location,
        'uploaded_at': file.uploaded_at,
        'file_category': categorize_file_type(file.mime_type)
    }
    
    # Update storage statistics
    update_storage_stats(file_stats)
    
    # Save to analytics
    save_file_stats(file_stats)
```

---

### Pipeline 4: Audit Log Processing

**Purpose**: Process audit logs for compliance and analytics

**Source**: `audit_logs` table (PostgreSQL)  
**Trigger**: Real-time (triggered on audit log creation)  
**Frequency**: Real-time processing

**Transformations**:
1. **Extract Action Metadata**: action_type, entity_type, user_role
2. **Parse JSONB Changes**: Extract before/after values from changes JSONB
3. **Calculate Activity Metrics**: Action frequency, user activity patterns

**Destination**: 
- `audit_analytics` table
- Compliance dashboard
- Security monitoring system

**Processing Logic**:
```python
def process_audit_log(log_id: str):
    log = get_audit_log(log_id)
    
    # Transform audit log
    audit_stats = {
        'log_id': log_id,
        'action_type': log.action_type,
        'entity_type': log.entity_type,
        'entity_id': log.entity_id,
        'user_id': log.user_id,
        'user_role': log.user_role,
        'timestamp': log.created_at,
        'has_changes': log.changes is not None,
        'change_count': count_changes(log.changes) if log.changes else 0
    }
    
    # Extract change details if available
    if log.changes:
        audit_stats['changes'] = parse_changes(log.changes)
    
    # Save to analytics
    save_audit_stats(audit_stats)
    
    # Check for security anomalies
    check_security_anomalies(audit_stats)
```

---

### Pipeline 5: Form Schema Change Tracking

**Purpose**: Track form schema changes for versioning and analytics

**Source**: `forms` table, `form_versions` table (PostgreSQL)  
**Trigger**: Real-time (triggered on form schema update)  
**Frequency**: Real-time processing

**Transformations**:
1. **Extract Schema Changes**: Compare old vs new schema_data JSONB
2. **Identify Field Changes**: Added/removed/modified fields
3. **Calculate Impact**: Impact on existing submissions

**Destination**: 
- `form_change_history` table
- Schema versioning system

**Processing Logic**:
```python
def track_schema_changes(form_id: str, new_schema: dict):
    old_schema = get_current_schema(form_id)
    
    # Compare schemas
    changes = compare_schemas(old_schema, new_schema)
    
    # Transform change data
    change_record = {
        'form_id': form_id,
        'version': new_schema.get('version'),
        'change_type': changes['type'],  # major, minor, patch
        'fields_added': changes['added'],
        'fields_removed': changes['removed'],
        'fields_modified': changes['modified'],
        'timestamp': datetime.utcnow(),
        'impact_analysis': analyze_impact(changes)
    }
    
    # Save to change history
    save_schema_changes(change_record)
```

---

## 🔧 DATA TRANSFORMATION RULES

### JSONB Data Extraction Rules

**Form Schema Extraction**:
```python
def extract_form_schema(schema_data: dict) -> dict:
    """Extract structured data from form schema JSONB."""
    return {
        'form_id': schema_data.get('formId'),
        'form_name': schema_data.get('formName'),
        'version': schema_data.get('version'),
        'step_count': len(schema_data.get('steps', [])),
        'field_count': sum(len(step.get('fields', [])) for step in schema_data.get('steps', [])),
        'estimated_time': schema_data.get('estimatedTime'),
        'fields': extract_fields(schema_data.get('steps', []))
    }
```

**Submission Data Extraction**:
```python
def extract_submission_data(submitted_data: dict, form_schema: dict) -> dict:
    """Extract structured data from submission JSONB."""
    extracted = {
        'fields_filled': 0,
        'fields_required': 0,
        'fields_optional': 0,
        'completion_rate': 0.0,
        'field_values': {}
    }
    
    # Count fields
    for step_id, step_data in submitted_data.items():
        if isinstance(step_data, dict):
            for field_name, field_value in step_data.items():
                extracted['fields_filled'] += 1
                extracted['field_values'][field_name] = field_value
    
    # Calculate completion rate
    total_required = count_required_fields(form_schema)
    extracted['fields_required'] = total_required
    extracted['completion_rate'] = extracted['fields_filled'] / total_required if total_required > 0 else 0
    
    return extracted
```

### Data Validation Rules

**Submission Data Validation**:
```python
def validate_submission_data(submitted_data: dict, form_schema: dict) -> ValidationResult:
    """Validate submission data against form schema."""
    errors = []
    
    # Validate required fields
    required_fields = get_required_fields(form_schema)
    for field_name in required_fields:
        if not field_exists(submitted_data, field_name):
            errors.append(f"Required field '{field_name}' is missing")
    
    # Validate field types
    for step_id, step_data in submitted_data.items():
        if isinstance(step_data, dict):
            for field_name, field_value in step_data.items():
                field_schema = get_field_schema(form_schema, field_name)
                if field_schema:
                    type_errors = validate_field_type(field_value, field_schema)
                    errors.extend(type_errors)
    
    return ValidationResult(is_valid=len(errors) == 0, errors=errors)
```

**Field Type Validation**:
```python
def validate_field_type(value: any, field_schema: dict) -> list:
    """Validate field value against field schema."""
    errors = []
    field_type = field_schema.get('fieldType')
    
    # Type-specific validation
    if field_type == 'input-number':
        if not isinstance(value, (int, float)):
            errors.append(f"Field '{field_schema.get('fieldName')}' must be a number")
    elif field_type == 'input-email':
        if not is_valid_email(value):
            errors.append(f"Field '{field_schema.get('fieldName')}' must be a valid email")
    elif field_type == 'select-single':
        options = field_schema.get('options', [])
        valid_values = [opt['value'] for opt in options]
        if value not in valid_values:
            errors.append(f"Field '{field_schema.get('fieldName')}' has invalid value")
    
    # Validation rules
    validation = field_schema.get('validation', {})
    if 'minLength' in validation and len(str(value)) < validation['minLength']:
        errors.append(f"Field '{field_schema.get('fieldName')}' is too short")
    if 'maxLength' in validation and len(str(value)) > validation['maxLength']:
        errors.append(f"Field '{field_schema.get('fieldName')}' is too long")
    if 'pattern' in validation and not re.match(validation['pattern'], value):
        errors.append(f"Field '{field_schema.get('fieldName')}' format is invalid")
    
    return errors
```

---

## 📈 DATA PROCESSING SCHEDULE

### Real-Time Processing
- **Form Submissions**: Triggered on INSERT/UPDATE (immediate)
- **File Uploads**: Triggered on INSERT (immediate)
- **Audit Logs**: Triggered on INSERT (immediate)
- **Schema Changes**: Triggered on UPDATE (immediate)

### Batch Processing
- **Daily Aggregation**: Scheduled at 00:00 UTC (daily)
- **Weekly Reports**: Scheduled on Sunday 00:00 UTC (weekly)
- **Monthly Analytics**: Scheduled on 1st of month 00:00 UTC (monthly)
- **Data Archival**: Scheduled on 1st of month 02:00 UTC (monthly)

---

## 🔄 DATA PIPELINE IMPLEMENTATION

### Python ETL Scripts

**Real-Time Processing** (FastAPI Background Tasks):
```python
from fastapi import BackgroundTasks
from sqlalchemy import event

# Database trigger for real-time processing
@event.listens_for(FormSubmission, 'after_insert')
def process_submission_on_insert(mapper, connection, target):
    """Trigger data processing pipeline on submission insert."""
    background_tasks.add_task(process_submission, target.id)

@event.listens_for(FormSubmission, 'after_update')
def process_submission_on_update(mapper, connection, target):
    """Trigger data processing pipeline on submission update."""
    background_tasks.add_task(process_submission, target.id)
```

**Batch Processing** (Scheduled Tasks):
```python
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

@scheduler.scheduled_job('cron', hour=0, minute=0)
def daily_aggregation():
    """Daily submission statistics aggregation."""
    date = datetime.utcnow().date().isoformat()
    aggregate_daily_stats(date)

@scheduler.scheduled_job('cron', day_of_week='sun', hour=0, minute=0)
def weekly_reports():
    """Weekly analytics reports generation."""
    generate_weekly_reports()

scheduler.start()
```

---

## 📊 DATA PIPELINE SUMMARY

| Pipeline ID | Name | Source | Frequency | Destination | Purpose |
|-------------|------|--------|-----------|-------------|---------|
| **P1** | Real-Time Submission Processing | form_submissions | Real-time | analytics_submissions, Redis | Process submissions as they arrive |
| **P2** | Daily Submission Analytics | form_submissions | Daily (00:00 UTC) | daily_submission_stats | Aggregate daily statistics |
| **P3** | File Upload Analytics | file_uploads | Real-time | file_upload_stats | Track file uploads and storage |
| **P4** | Audit Log Processing | audit_logs | Real-time | audit_analytics | Process audit logs for compliance |
| **P5** | Schema Change Tracking | forms, form_versions | Real-time | form_change_history | Track form schema changes |

**Total Pipelines**: 5  
**Real-Time**: 4 pipelines  
**Batch**: 1 pipeline (daily aggregation)

---

**Document Status**: ✅ Complete  
**Next Phase**: Analytics Data Models and Reporting  
**Last Updated**: 2025-11-17 15:34:58

