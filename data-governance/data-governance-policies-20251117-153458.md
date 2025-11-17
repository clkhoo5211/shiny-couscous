# 🔒 Labuan FSA E-Submission System - Data Governance Policies

**Project**: Labuan FSA E-Online Submission System  
**Created**: 2025-11-17 15:34:58  
**Status**: Data Phase  
**Version**: 1.0.0

---

## 🎯 DATA GOVERNANCE OVERVIEW

**Governance Framework**: Data Privacy, Security, Quality, Compliance  
**Standards**: GDPR, ISO 27001, Data Protection Act (Malaysia)  
**Compliance**: Financial regulatory requirements (Labuan FSA)

---

## 🔐 DATA PRIVACY & SECURITY

### Data Classification

**Data Categories**:

1. **Public Data** (No restrictions)
   - Form schemas (structure only, no submitted data)
   - Public form metadata (name, description, category)
   - System documentation

2. **Internal Data** (Restricted to Labuan FSA staff)
   - Form submissions (submitted_data)
   - Submission status and review notes
   - Admin dashboard data

3. **Confidential Data** (Highly restricted)
   - User account information (passwords, personal data)
   - File uploads (documents, certificates)
   - Audit logs with sensitive information
   - Payment information (if applicable)

4. **Restricted Data** (Strictly controlled)
   - Security keys and credentials
   - System configuration secrets
   - Financial data (if applicable)

### Data Access Control

**Access Control Model**: Role-Based Access Control (RBAC)

**Roles**:
- **Public**: Read-only access to form list and public information
- **User**: Submit forms, view own submissions
- **Reviewer**: Review and process submissions
- **Admin**: Full access including form schema management
- **Auditor**: Read-only access to audit logs

**Access Control Rules**:
```sql
-- Example: Users can only view their own submissions
CREATE POLICY user_submission_access ON form_submissions
    FOR SELECT
    USING (submitted_by = current_user_email());

-- Example: Admins can view all submissions
CREATE POLICY admin_submission_access ON form_submissions
    FOR ALL
    USING (user_role = 'admin' OR user_role = 'reviewer');
```

---

## 📋 DATA RETENTION POLICY

### Retention Periods

| Data Type | Retention Period | Retention Reason | Archival Policy |
|-----------|------------------|------------------|-----------------|
| **Form Submissions** | 7 years | Regulatory compliance | Archive to cold storage after 1 year |
| **File Uploads** | 7 years | Regulatory compliance | Archive to cold storage after 1 year |
| **Audit Logs** | 10 years | Compliance & security | Archive to cold storage after 3 years |
| **Form Schemas** | Indefinite | Historical reference | Keep active, archive old versions |
| **Analytics Data** | 5 years | Business intelligence | Archive to cold storage after 2 years |
| **User Accounts** | 3 years after last login | User data protection | Delete after 3 years of inactivity |
| **Draft Submissions** | 90 days | Data minimization | Auto-delete after 90 days |

### Data Archival Process

**Archival Strategy**:
1. **Hot Storage** (PostgreSQL): Active data (0-1 year)
2. **Warm Storage** (PostgreSQL partitioned): Archived data (1-3 years)
3. **Cold Storage** (Object storage - S3/Glacier): Long-term archival (3+ years)

**Archival Implementation**:
```python
def archive_old_submissions(retention_years: int = 7):
    """Archive submissions older than retention period."""
    cutoff_date = datetime.utcnow() - timedelta(days=retention_years * 365)
    
    # Find old submissions
    old_submissions = db.query(FormSubmission).filter(
        FormSubmission.submitted_at < cutoff_date,
        FormSubmission.status == 'archived'  # Only archive completed submissions
    ).all()
    
    # Archive to cold storage
    for submission in old_submissions:
        archive_submission(submission)
        
        # Update status
        submission.status = 'archived'
        submission.archived_at = datetime.utcnow()
    
    db.commit()
```

---

## 🛡️ DATA QUALITY & VALIDATION

### Data Quality Rules

**Completeness Rules**:
- Required fields must be present in submissions
- Form schemas must have all required metadata
- File uploads must have complete metadata

**Accuracy Rules**:
- Submission data must match form schema structure
- Field values must conform to validation rules
- Timestamps must be valid and consistent

**Consistency Rules**:
- Form IDs must match between forms and submissions
- Submission IDs must be unique
- Status transitions must follow valid workflow

**Integrity Rules**:
- Foreign key relationships must be maintained
- JSONB structures must be valid JSON
- File references must point to existing files

### Data Quality Monitoring

**Quality Metrics**:
```python
def calculate_data_quality_metrics():
    """Calculate data quality metrics."""
    total_submissions = db.query(FormSubmission).count()
    
    # Completeness
    incomplete_submissions = db.query(FormSubmission).filter(
        FormSubmission.submitted_data == None
    ).count()
    completeness_rate = (1 - incomplete_submissions / total_submissions) * 100
    
    # Accuracy (submissions with validation errors)
    validation_errors = db.query(AuditLog).filter(
        AuditLog.action_type == 'validation_error'
    ).count()
    accuracy_rate = (1 - validation_errors / total_submissions) * 100
    
    # Consistency (orphaned records)
    orphaned_submissions = db.query(FormSubmission).filter(
        ~exists().where(Form.id == FormSubmission.form_id)
    ).count()
    consistency_rate = (1 - orphaned_submissions / total_submissions) * 100
    
    return {
        'completeness_rate': completeness_rate,
        'accuracy_rate': accuracy_rate,
        'consistency_rate': consistency_rate,
        'overall_quality_score': (completeness_rate + accuracy_rate + consistency_rate) / 3
    }
```

---

## 📜 DATA LINEAGE & CATALOGING

### Data Lineage Documentation

**Data Flow Tracking**:
```
Form Submission (form_submissions table)
  ↓
Real-Time Processing Pipeline (P1)
  ↓
Analytics Submissions (analytics_submissions table)
  ↓
Daily Aggregation Pipeline (P2)
  ↓
Daily Statistics (analytics_daily_submission_stats table)
  ↓
Reporting Dashboard (Admin Dashboard)
```

**Data Catalog**:
```python
DATA_CATALOG = {
    'form_submissions': {
        'source': 'User form submissions',
        'destination': ['analytics_submissions', 'daily_submission_stats'],
        'update_frequency': 'Real-time',
        'retention': '7 years',
        'sensitivity': 'Confidential',
        'pii_fields': ['submitted_by', 'submitted_data.email', 'submitted_data.phone']
    },
    'analytics_submissions': {
        'source': 'form_submissions (ETL pipeline)',
        'destination': ['admin_dashboard', 'reports'],
        'update_frequency': 'Real-time',
        'retention': '5 years',
        'sensitivity': 'Internal',
        'pii_fields': ['user_id']
    }
}
```

---

## 🔒 DATA SECURITY

### Encryption

**Encryption at Rest**:
- Database encryption: PostgreSQL transparent data encryption (TDE)
- File storage encryption: AES-256 encryption for file uploads
- Backup encryption: Encrypted backups with key rotation

**Encryption in Transit**:
- HTTPS/TLS 1.2+ for all API communications
- Database connections: SSL/TLS for PostgreSQL connections
- File transfers: Encrypted file transfers to cloud storage

### Data Anonymization

**Anonymization for Analytics**:
```python
def anonymize_submission_data(submission: FormSubmission) -> dict:
    """Anonymize submission data for analytics."""
    anonymized = submission.submitted_data.copy()
    
    # Anonymize PII fields
    if 'email' in anonymized:
        anonymized['email'] = hash_email(anonymized['email'])
    if 'phone' in anonymized:
        anonymized['phone'] = hash_phone(anonymized['phone'])
    if 'name' in anonymized:
        anonymized['name'] = 'ANONYMIZED'
    
    return anonymized
```

---

## 📊 DATA COMPLIANCE

### GDPR Compliance

**Data Subject Rights**:
- **Right to Access**: Users can request their submission data
- **Right to Rectification**: Users can update their submission data (before review)
- **Right to Erasure**: Users can request deletion of their data (draft submissions)
- **Right to Data Portability**: Users can export their submission data

**Implementation**:
```python
# GET /api/user/data-export
def export_user_data(user_id: str):
    """Export all user data for GDPR compliance."""
    submissions = db.query(FormSubmission).filter(
        FormSubmission.submitted_by == user_id
    ).all()
    
    export_data = {
        'user_id': user_id,
        'submissions': [
            {
                'submission_id': s.submission_id,
                'form_id': s.form_id,
                'submitted_data': s.submitted_data,
                'status': s.status,
                'submitted_at': s.submitted_at.isoformat()
            }
            for s in submissions
        ],
        'files': get_user_files(user_id),
        'exported_at': datetime.utcnow().isoformat()
    }
    
    return export_data

# DELETE /api/user/data-deletion
def delete_user_data(user_id: str):
    """Delete user data for GDPR compliance."""
    # Only delete draft submissions
    draft_submissions = db.query(FormSubmission).filter(
        FormSubmission.submitted_by == user_id,
        FormSubmission.status == 'draft'
    ).all()
    
    for submission in draft_submissions:
        # Delete associated files
        delete_submission_files(submission.id)
        # Delete submission
        db.delete(submission)
    
    db.commit()
```

---

## 📋 DATA GOVERNANCE SUMMARY

| Governance Area | Policies | Implementation |
|----------------|----------|----------------|
| **Data Classification** | 4 categories (Public, Internal, Confidential, Restricted) | RBAC, data tagging |
| **Access Control** | Role-based access (5 roles) | PostgreSQL Row Level Security |
| **Data Retention** | 7-10 years for submissions, 90 days for drafts | Automated archival process |
| **Data Quality** | Completeness, accuracy, consistency rules | Quality monitoring, validation |
| **Data Lineage** | Full data flow tracking | Data catalog, lineage documentation |
| **Data Security** | Encryption at rest and in transit | TDE, TLS, AES-256 |
| **Data Privacy** | GDPR compliance, anonymization | Data export, deletion, anonymization |
| **Compliance** | Regulatory compliance (Labuan FSA) | Audit logs, retention policies |

**Total Governance Policies**: 8  
**Compliance Standards**: GDPR, ISO 27001, Data Protection Act (Malaysia)

---

**Document Status**: ✅ Complete  
**Next Phase**: Data Quality Report  
**Last Updated**: 2025-11-17 15:34:58

