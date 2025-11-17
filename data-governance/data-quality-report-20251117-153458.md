# ✅ Labuan FSA E-Submission System - Data Quality Report

**Project**: Labuan FSA E-Online Submission System  
**Created**: 2025-11-17 15:34:58  
**Status**: Data Phase  
**Version**: 1.0.0

---

## 🎯 DATA QUALITY OVERVIEW

**Quality Framework**: Completeness, Accuracy, Consistency, Timeliness, Validity  
**Monitoring**: Real-time validation, scheduled quality checks, automated reporting  
**Metrics**: Quality score, error rates, data completeness rates

---

## 📊 DATA QUALITY METRICS

### Metric 1: Completeness Score

**Definition**: Percentage of required fields populated in submissions

**Calculation**:
```python
completeness_score = (filled_fields / required_fields) * 100
```

**Target**: ≥ 95%  
**Current**: TBD (to be calculated after data collection)

**Monitoring**:
- Real-time validation on submission
- Daily completeness report
- Alert if completeness < 90%

---

### Metric 2: Accuracy Score

**Definition**: Percentage of submissions passing validation rules

**Calculation**:
```python
accuracy_score = (valid_submissions / total_submissions) * 100
```

**Target**: ≥ 98%  
**Current**: TBD

**Validation Rules**:
- Field type validation (email format, number format, etc.)
- Pattern validation (phone numbers, registration numbers, etc.)
- Range validation (min/max length, min/max values)
- Required field validation

**Monitoring**:
- Real-time validation on submission
- Validation error tracking in audit logs
- Daily accuracy report

---

### Metric 3: Consistency Score

**Definition**: Percentage of submissions with consistent data relationships

**Calculation**:
```python
consistency_score = (consistent_submissions / total_submissions) * 100
```

**Target**: ≥ 99%  
**Current**: TBD

**Consistency Checks**:
- Form ID exists in forms table
- Submission ID uniqueness
- File references point to existing files
- Status transitions follow valid workflow

**Monitoring**:
- Database constraint checks (foreign keys, unique constraints)
- Scheduled consistency checks (daily)
- Alert on consistency violations

---

### Metric 4: Timeliness Score

**Definition**: Percentage of submissions processed within SLA

**Calculation**:
```python
timeliness_score = (on_time_submissions / total_submissions) * 100
```

**Target**: ≥ 95% (within 5 business days)  
**Current**: TBD

**SLA Definition**:
- Draft to Submitted: Immediate (user action)
- Submitted to Reviewing: < 1 business day
- Reviewing to Approved/Rejected: < 5 business days

**Monitoring**:
- Real-time processing time tracking
- Daily timeliness report
- Alert if processing time exceeds SLA

---

### Metric 5: Validity Score

**Definition**: Percentage of submissions with valid JSONB structure

**Calculation**:
```python
validity_score = (valid_jsonb_submissions / total_submissions) * 100
```

**Target**: 100%  
**Current**: TBD

**Validity Checks**:
- JSONB structure matches form schema
- Field names match schema definitions
- Data types match field types
- Nested structures are valid

**Monitoring**:
- Real-time JSONB validation
- Schema validation on submission
- Alert on validity errors

---

## 🔍 DATA QUALITY MONITORING

### Real-Time Quality Checks

**On Submission**:
1. Validate JSONB structure
2. Validate required fields
3. Validate field types and formats
4. Validate business rules
5. Check referential integrity

**Quality Check Result**:
```json
{
  "submission_id": "SUB-20251117-001234",
  "quality_score": 95.5,
  "checks": {
    "completeness": {"score": 100, "passed": true},
    "accuracy": {"score": 98, "passed": true},
    "consistency": {"score": 100, "passed": true},
    "validity": {"score": 100, "passed": true}
  },
  "errors": [],
  "warnings": [
    "Field 'phone' format is non-standard"
  ]
}
```

---

### Scheduled Quality Checks

**Daily Quality Report**:
```python
def generate_daily_quality_report(date: str):
    """Generate daily data quality report."""
    submissions = get_submissions_by_date(date)
    
    quality_metrics = {
        'date': date,
        'total_submissions': len(submissions),
        'completeness_score': calculate_completeness_score(submissions),
        'accuracy_score': calculate_accuracy_score(submissions),
        'consistency_score': calculate_consistency_score(submissions),
        'timeliness_score': calculate_timeliness_score(submissions),
        'validity_score': calculate_validity_score(submissions),
        'overall_quality_score': calculate_overall_score(submissions),
        'error_breakdown': {
            'validation_errors': count_validation_errors(submissions),
            'missing_fields': count_missing_fields(submissions),
            'invalid_formats': count_invalid_formats(submissions),
            'inconsistencies': count_inconsistencies(submissions)
        }
    }
    
    # Alert if quality drops below threshold
    if quality_metrics['overall_quality_score'] < 90:
        send_quality_alert(quality_metrics)
    
    return quality_metrics
```

---

## 📋 DATA QUALITY RULES

### Rule 1: Required Field Validation

**Rule**: All required fields must be present in submissions

**Implementation**:
```python
def validate_required_fields(submitted_data: dict, form_schema: dict) -> list:
    """Validate required fields are present."""
    errors = []
    required_fields = get_required_fields(form_schema)
    
    for field_name in required_fields:
        if not field_exists(submitted_data, field_name):
            errors.append(f"Required field '{field_name}' is missing")
        elif is_empty(submitted_data[field_name]):
            errors.append(f"Required field '{field_name}' is empty")
    
    return errors
```

---

### Rule 2: Field Type Validation

**Rule**: Field values must match their declared types

**Implementation**:
```python
def validate_field_types(submitted_data: dict, form_schema: dict) -> list:
    """Validate field types match schema."""
    errors = []
    
    for step_id, step_data in submitted_data.items():
        if isinstance(step_data, dict):
            for field_name, field_value in step_data.items():
                field_schema = get_field_schema(form_schema, field_name)
                if field_schema:
                    expected_type = field_schema.get('fieldType')
                    if not is_valid_type(field_value, expected_type):
                        errors.append(f"Field '{field_name}' has invalid type. Expected: {expected_type}")
    
    return errors
```

---

### Rule 3: Pattern Validation

**Rule**: Field values must match specified patterns (email, phone, etc.)

**Implementation**:
```python
def validate_patterns(submitted_data: dict, form_schema: dict) -> list:
    """Validate field patterns."""
    errors = []
    
    for step_id, step_data in submitted_data.items():
        if isinstance(step_data, dict):
            for field_name, field_value in step_data.items():
                field_schema = get_field_schema(form_schema, field_name)
                if field_schema:
                    validation = field_schema.get('validation', {})
                    pattern = validation.get('pattern')
                    if pattern and not re.match(pattern, str(field_value)):
                        errors.append(f"Field '{field_name}' does not match required pattern")
    
    return errors
```

---

### Rule 4: Range Validation

**Rule**: Field values must be within specified ranges (min/max length, min/max values)

**Implementation**:
```python
def validate_ranges(submitted_data: dict, form_schema: dict) -> list:
    """Validate field ranges."""
    errors = []
    
    for step_id, step_data in submitted_data.items():
        if isinstance(step_data, dict):
            for field_name, field_value in step_data.items():
                field_schema = get_field_schema(form_schema, field_name)
                if field_schema:
                    validation = field_schema.get('validation', {})
                    
                    # Length validation
                    if 'minLength' in validation:
                        if len(str(field_value)) < validation['minLength']:
                            errors.append(f"Field '{field_name}' is too short (min: {validation['minLength']})")
                    if 'maxLength' in validation:
                        if len(str(field_value)) > validation['maxLength']:
                            errors.append(f"Field '{field_name}' is too long (max: {validation['maxLength']})")
                    
                    # Value validation (for numbers)
                    if 'min' in validation:
                        if float(field_value) < validation['min']:
                            errors.append(f"Field '{field_name}' is below minimum value ({validation['min']})")
                    if 'max' in validation:
                        if float(field_value) > validation['max']:
                            errors.append(f"Field '{field_name}' exceeds maximum value ({validation['max']})")
    
    return errors
```

---

### Rule 5: Referential Integrity Validation

**Rule**: All references must point to existing entities

**Implementation**:
```python
def validate_referential_integrity(submission: FormSubmission) -> list:
    """Validate referential integrity."""
    errors = []
    
    # Check form exists
    form = db.query(Form).filter(Form.form_id == submission.form_id).first()
    if not form:
        errors.append(f"Form '{submission.form_id}' does not exist")
    
    # Check file references
    files = db.query(FileUpload).filter(FileUpload.submission_id == submission.id).all()
    for file in files:
        if not file_exists(file.file_path):
            errors.append(f"File reference '{file.file_id}' points to non-existent file")
    
    return errors
```

---

## 📊 DATA QUALITY DASHBOARD

### Quality Metrics Display

**Dashboard Components**:
1. **Overall Quality Score**: Composite score (0-100)
2. **Quality Breakdown**: Completeness, Accuracy, Consistency, Timeliness, Validity
3. **Quality Trends**: Line chart showing quality over time (30 days)
4. **Error Breakdown**: Pie chart of error types
5. **Top Issues**: Table of most common quality issues
6. **Quality Alerts**: List of active quality alerts

---

## 🔔 DATA QUALITY ALERTS

### Alert Thresholds

| Metric | Warning Threshold | Critical Threshold | Action |
|--------|-------------------|-------------------|--------|
| **Completeness Score** | < 95% | < 90% | Review validation rules |
| **Accuracy Score** | < 98% | < 95% | Review validation logic |
| **Consistency Score** | < 99% | < 95% | Check database constraints |
| **Timeliness Score** | < 95% | < 90% | Review processing workflow |
| **Validity Score** | < 100% | < 98% | Review JSONB validation |

### Alert Notification

**Alert Channels**:
- Email to data team
- Dashboard alert banner
- Slack/Teams notification (optional)

**Alert Format**:
```json
{
  "alert_type": "data_quality",
  "severity": "warning" | "critical",
  "metric": "completeness_score",
  "current_value": 92.5,
  "threshold": 95.0,
  "affected_entities": 25,
  "recommended_action": "Review validation rules for form-a",
  "timestamp": "2025-11-17T16:00:00Z"
}
```

---

## 📋 DATA QUALITY SUMMARY

| Quality Dimension | Target | Monitoring | Alert Threshold |
|------------------|--------|------------|-----------------|
| **Completeness** | ≥ 95% | Real-time, Daily | < 90% (Critical) |
| **Accuracy** | ≥ 98% | Real-time, Daily | < 95% (Critical) |
| **Consistency** | ≥ 99% | Real-time, Daily | < 95% (Critical) |
| **Timeliness** | ≥ 95% | Real-time, Daily | < 90% (Critical) |
| **Validity** | 100% | Real-time | < 98% (Critical) |

**Total Quality Rules**: 5  
**Quality Checks**: Real-time + Daily batch  
**Quality Metrics**: 5 dimensions

---

**Document Status**: ✅ Complete  
**Next Phase**: Data Agent Completion  
**Last Updated**: 2025-11-17 15:34:58

