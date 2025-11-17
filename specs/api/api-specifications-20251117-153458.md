# 🔌 Labuan FSA E-Submission System - API Specifications

**Project**: Labuan FSA E-Online Submission System  
**Created**: 2025-11-17 15:34:58  
**Status**: Design Phase  
**Version**: 1.0.0  
**API Version**: v1

---

## 🎯 API OVERVIEW

**Base URL**: `https://api.labuanfsa.gov.my/v1`  
**Protocol**: HTTPS (TLS 1.2+)  
**Content-Type**: `application/json`  
**Authentication**: JWT Bearer Token

**Total Endpoints**: 25+  
**API Categories**: Forms, Submissions, Files, Admin, Auth

---

## 🔐 AUTHENTICATION

### JWT Authentication
All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

**Token Structure**:
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "user" | "admin",
  "exp": 1234567890,
  "iat": 1234567890
}
```

**Token Expiry**: 30 minutes  
**Refresh Token**: 7 days

---

## 📋 FORMS API

### GET /api/forms
**Description**: List all available forms

**Authentication**: Optional (public forms don't require auth)

**Query Parameters**:
- `status`: Filter by status (`active`, `inactive`, `all`) - Default: `active`
- `category`: Filter by category
- `search`: Search by name or description

**Response** (`200 OK`):
```json
{
  "forms": [
    {
      "formId": "form-a",
      "name": "Form A: Business License Application",
      "description": "Application for new business license",
      "version": "1.0.0",
      "steps": 3,
      "estimatedTime": "30 minutes",
      "category": "license",
      "status": "active",
      "createdAt": "2025-11-17T15:34:58Z",
      "updatedAt": "2025-11-17T15:34:58Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

### GET /api/forms/{formId}
**Description**: Get form details

**Authentication**: Optional

**Path Parameters**:
- `formId`: Form identifier (string, required)

**Response** (`200 OK`):
```json
{
  "formId": "form-a",
  "name": "Form A: Business License Application",
  "description": "Application for new business license",
  "version": "1.0.0",
  "category": "license",
  "status": "active",
  "estimatedTime": "30 minutes",
  "requirements": [
    "Business registration certificate",
    "Identity proof",
    "Address proof"
  ],
  "createdAt": "2025-11-17T15:34:58Z",
  "updatedAt": "2025-11-17T15:34:58Z"
}
```

**Error Responses**:
- `404 Not Found`: Form not found

---

### GET /api/forms/{formId}/schema
**Description**: Get complete form schema for dynamic rendering

**Authentication**: Optional

**Path Parameters**:
- `formId`: Form identifier (string, required)

**Response** (`200 OK`):
```json
{
  "formId": "form-a",
  "formName": "Form A: Business License Application",
  "version": "1.0.0",
  "steps": [
    {
      "stepId": "step-1",
      "stepName": "Business Information",
      "stepOrder": 1,
      "stepDescription": "Enter your business details",
      "fields": [
        {
          "fieldId": "company-name",
          "fieldType": "input-text",
          "inputType": "text",
          "fieldName": "companyName",
          "label": "Company Name",
          "placeholder": "Enter your company name",
          "required": true,
          "disabled": false,
          "readonly": false,
          "hidden": false,
          "defaultValue": null,
          "validation": {
            "minLength": 2,
            "maxLength": 255,
            "pattern": "^[a-zA-Z0-9\\s-]+$",
            "errorMessage": "Company name must be 2-255 characters"
          },
          "style": {
            "className": "w-full px-4 py-2 border rounded-md",
            "containerClassName": "mb-4",
            "labelClassName": "block text-sm font-medium mb-1"
          },
          "helpText": "Enter the registered company name as shown on your certificate",
          "tooltip": "This is the official company name",
          "conditionalDisplay": {
            "when": null,
            "show": true
          }
        },
        {
          "fieldId": "business-type",
          "fieldType": "select-single",
          "fieldName": "businessType",
          "label": "Business Type",
          "placeholder": "Select business type",
          "required": true,
          "options": [
            {
              "value": "sdn-bhd",
              "label": "Sdn Bhd",
              "description": "Sendirian Berhad"
            },
            {
              "value": "enterprise",
              "label": "Enterprise",
              "description": "Enterprise"
            },
            {
              "value": "partnership",
              "label": "Partnership",
              "description": "Partnership"
            },
            {
              "value": "other",
              "label": "Other",
              "showInput": true
            }
          ],
          "searchable": true,
          "validation": {
            "required": true,
            "errorMessage": "Please select a business type"
          }
        },
        {
          "fieldId": "registration-number",
          "fieldType": "input-text",
          "inputType": "text",
          "fieldName": "registrationNumber",
          "label": "Registration Number",
          "placeholder": "e.g., 123456-X",
          "required": true,
          "validation": {
            "pattern": "^[0-9]{6}-[A-Z]$",
            "errorMessage": "Format: 123456-X"
          }
        }
      ]
    },
    {
      "stepId": "step-2",
      "stepName": "Contact Information",
      "stepOrder": 2,
      "fields": [
        {
          "fieldId": "contact-email",
          "fieldType": "input-email",
          "fieldName": "contactEmail",
          "label": "Contact Email",
          "placeholder": "contact@example.com",
          "required": true,
          "validation": {
            "type": "email",
            "errorMessage": "Please enter a valid email address"
          }
        },
        {
          "fieldId": "contact-phone",
          "fieldType": "input-tel",
          "fieldName": "contactPhone",
          "label": "Contact Phone",
          "placeholder": "+60123456789",
          "required": true,
          "validation": {
            "pattern": "^\\+?[0-9]{10,15}$",
            "errorMessage": "Please enter a valid phone number"
          }
        }
      ]
    },
    {
      "stepId": "step-3",
      "stepName": "Documents",
      "stepOrder": 3,
      "fields": [
        {
          "fieldId": "business-certificate",
          "fieldType": "upload-document",
          "fieldName": "businessCertificate",
          "label": "Business Certificate",
          "required": true,
          "multiple": false,
          "accept": [".pdf", ".jpg", ".png"],
          "maxSize": 10485760,
          "maxFiles": 1,
          "dragDrop": true,
          "preview": true,
          "validation": {
            "required": true,
            "fileTypes": [".pdf", ".jpg", ".png"],
            "maxSize": 10485760,
            "errorMessage": "Please upload a PDF, JPG, or PNG file (max 10MB)"
          }
        }
      ]
    }
  ],
  "estimatedTime": "30 minutes",
  "submitButton": {
    "label": "Submit Application",
    "className": "bg-blue-600 text-white px-6 py-3 rounded-md"
  }
}
```

**Error Responses**:
- `404 Not Found`: Form not found
- `400 Bad Request`: Invalid form ID format

---

## 📝 SUBMISSIONS API

### POST /api/forms/{formId}/validate
**Description**: Validate submission data before submitting

**Authentication**: Required

**Path Parameters**:
- `formId`: Form identifier (string, required)

**Request Body**:
```json
{
  "data": {
    "step-1": {
      "companyName": "ABC Company Sdn Bhd",
      "businessType": "sdn-bhd",
      "registrationNumber": "123456-X"
    },
    "step-2": {
      "contactEmail": "contact@example.com",
      "contactPhone": "+60123456789"
    }
  },
  "stepId": "step-1"
}
```

**Response** (`200 OK`):
```json
{
  "valid": true,
  "errors": []
}
```

**Response** (`400 Bad Request` - Validation Errors):
```json
{
  "valid": false,
  "errors": [
    {
      "fieldId": "company-name",
      "fieldName": "companyName",
      "stepId": "step-1",
      "error": "Company name is required",
      "errorCode": "REQUIRED"
    },
    {
      "fieldId": "registration-number",
      "fieldName": "registrationNumber",
      "stepId": "step-1",
      "error": "Invalid format. Expected: 123456-X",
      "errorCode": "PATTERN_MISMATCH"
    }
  ]
}
```

---

### POST /api/forms/{formId}/submit
**Description**: Submit form data

**Authentication**: Required

**Path Parameters**:
- `formId`: Form identifier (string, required)

**Request Body**:
```json
{
  "data": {
    "step-1": {
      "companyName": "ABC Company Sdn Bhd",
      "businessType": "sdn-bhd",
      "registrationNumber": "123456-X"
    },
    "step-2": {
      "contactEmail": "contact@example.com",
      "contactPhone": "+60123456789"
    },
    "step-3": {
      "businessCertificate": {
        "fileId": "uuid-here",
        "fileName": "certificate.pdf"
      }
    }
  },
  "files": [
    {
      "fieldName": "businessCertificate",
      "fileId": "uuid-here",
      "fileName": "certificate.pdf"
    }
  ]
}
```

**Response** (`201 Created`):
```json
{
  "formId": "form-a",
  "submissionId": "SUB-20251117-001234",
  "status": "submitted",
  "message": "Form submitted successfully",
  "submittedAt": "2025-11-17T15:34:58Z",
  "estimatedReviewTime": "5-7 business days"
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors (same format as validate endpoint)
- `404 Not Found`: Form not found
- `413 Payload Too Large`: Submission data too large

---

### POST /api/forms/{formId}/draft
**Description**: Save draft submission

**Authentication**: Required

**Path Parameters**:
- `formId`: Form identifier (string, required)

**Request Body**:
```json
{
  "data": {
    "step-1": {
      "companyName": "ABC Company Sdn Bhd",
      "businessType": "sdn-bhd"
    }
  },
  "stepId": "step-1"
}
```

**Response** (`200 OK`):
```json
{
  "formId": "form-a",
  "draftId": "DRAFT-20251117-001234",
  "status": "draft",
  "savedAt": "2025-11-17T15:34:58Z",
  "stepId": "step-1"
}
```

---

### GET /api/submissions
**Description**: List user's submissions

**Authentication**: Required

**Query Parameters**:
- `formId`: Filter by form ID
- `status`: Filter by status (`draft`, `submitted`, `reviewing`, `approved`, `rejected`)
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20, max: 100)
- `sortBy`: Sort field (`submittedAt`, `status`, `formId`) - Default: `submittedAt`
- `sortOrder`: Sort order (`asc`, `desc`) - Default: `desc`

**Response** (`200 OK`):
```json
{
  "submissions": [
    {
      "submissionId": "SUB-20251117-001234",
      "formId": "form-a",
      "formName": "Form A: Business License Application",
      "status": "submitted",
      "submittedAt": "2025-11-17T15:34:58Z",
      "reviewedAt": null,
      "reviewNotes": null
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

### GET /api/submissions/{submissionId}
**Description**: Get submission details

**Authentication**: Required (must own submission or be admin)

**Path Parameters**:
- `submissionId`: Submission identifier (string, required)

**Response** (`200 OK`):
```json
{
  "submissionId": "SUB-20251117-001234",
  "formId": "form-a",
  "formName": "Form A: Business License Application",
  "status": "submitted",
  "data": {
    "step-1": {
      "companyName": "ABC Company Sdn Bhd",
      "businessType": "sdn-bhd",
      "registrationNumber": "123456-X"
    },
    "step-2": {
      "contactEmail": "contact@example.com",
      "contactPhone": "+60123456789"
    }
  },
  "files": [
    {
      "fieldName": "businessCertificate",
      "fileName": "certificate.pdf",
      "fileId": "uuid-here",
      "fileSize": 1048576,
      "mimeType": "application/pdf",
      "uploadedAt": "2025-11-17T15:34:58Z"
    }
  ],
  "submittedBy": "user@example.com",
  "submittedAt": "2025-11-17T15:34:58Z",
  "reviewedBy": null,
  "reviewedAt": null,
  "reviewNotes": null,
  "timeline": [
    {
      "status": "submitted",
      "timestamp": "2025-11-17T15:34:58Z",
      "user": "user@example.com"
    }
  ]
}
```

**Error Responses**:
- `404 Not Found`: Submission not found
- `403 Forbidden`: User not authorized to view submission

---

## 📤 FILE UPLOAD API

### POST /api/files/upload
**Description**: Upload file

**Authentication**: Required

**Content-Type**: `multipart/form-data`

**Request Body** (Form Data):
- `file`: File to upload (required)
- `fieldName`: Field name for this upload (required)
- `formId`: Form ID (optional, for context)
- `submissionId`: Submission ID (optional, for draft)

**Response** (`201 Created`):
```json
{
  "fileId": "uuid-here",
  "fileName": "certificate.pdf",
  "fileSize": 1048576,
  "mimeType": "application/pdf",
  "uploadUrl": "/api/files/uuid-here/download",
  "uploadedAt": "2025-11-17T15:34:58Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid file type or size
- `413 Payload Too Large`: File too large

---

### GET /api/files/{fileId}/download
**Description**: Download file

**Authentication**: Required (must own submission or be admin)

**Path Parameters**:
- `fileId`: File identifier (UUID, required)

**Response** (`200 OK`):
- Content-Type: File MIME type
- Content-Disposition: `attachment; filename="certificate.pdf"`
- Body: File binary data

**Error Responses**:
- `404 Not Found`: File not found
- `403 Forbidden`: User not authorized to download file

---

### DELETE /api/files/{fileId}
**Description**: Delete file

**Authentication**: Required (must own submission or be admin)

**Path Parameters**:
- `fileId`: File identifier (UUID, required)

**Response** (`200 OK`):
```json
{
  "message": "File deleted successfully",
  "fileId": "uuid-here"
}
```

---

## 🎛️ ADMIN API

### GET /api/admin/submissions
**Description**: List all submissions (admin only)

**Authentication**: Required (admin role)

**Query Parameters**:
- `formId`: Filter by form ID
- `status`: Filter by status
- `submittedBy`: Filter by submitter email
- `dateFrom`: Filter from date (ISO 8601)
- `dateTo`: Filter to date (ISO 8601)
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20, max: 100)
- `sortBy`: Sort field - Default: `submittedAt`
- `sortOrder`: Sort order - Default: `desc`

**Response** (`200 OK`):
```json
{
  "submissions": [
    {
      "submissionId": "SUB-20251117-001234",
      "formId": "form-a",
      "formName": "Form A: Business License Application",
      "status": "submitted",
      "submittedBy": "user@example.com",
      "submittedAt": "2025-11-17T15:34:58Z",
      "reviewedBy": null,
      "reviewedAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 500,
    "totalPages": 25
  },
  "statistics": {
    "total": 500,
    "submitted": 300,
    "reviewing": 50,
    "approved": 100,
    "rejected": 50
  }
}
```

---

### GET /api/admin/submissions/{submissionId}
**Description**: Get submission details (admin only)

**Authentication**: Required (admin role)

**Response**: Same as GET /api/submissions/{submissionId}

---

### PUT /api/admin/submissions/{submissionId}
**Description**: Review submission (approve/reject/request info)

**Authentication**: Required (admin role)

**Path Parameters**:
- `submissionId`: Submission identifier (string, required)

**Request Body**:
```json
{
  "action": "approve" | "reject" | "request-info",
  "reviewNotes": "Application approved. License will be issued within 5 business days.",
  "requestedInfo": [
    "Additional document required: Updated business certificate"
  ]
}
```

**Response** (`200 OK`):
```json
{
  "submissionId": "SUB-20251117-001234",
  "status": "approved",
  "reviewedBy": "admin@labuanfsa.gov.my",
  "reviewedAt": "2025-11-17T16:00:00Z",
  "reviewNotes": "Application approved. License will be issued within 5 business days.",
  "message": "Submission reviewed successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid action or missing required fields
- `404 Not Found`: Submission not found
- `409 Conflict`: Submission already reviewed

---

### GET /api/admin/forms
**Description**: List all forms for management (admin only)

**Authentication**: Required (admin role)

**Response**: Same as GET /api/forms (with additional fields)

---

### POST /api/admin/forms
**Description**: Create new form schema (admin only)

**Authentication**: Required (admin role)

**Request Body**:
```json
{
  "formId": "form-new",
  "name": "New Form",
  "description": "Form description",
  "version": "1.0.0",
  "schemaData": {
    "formId": "form-new",
    "steps": [...]
  },
  "isActive": false
}
```

**Response** (`201 Created`):
```json
{
  "formId": "form-new",
  "name": "New Form",
  "version": "1.0.0",
  "isActive": false,
  "createdAt": "2025-11-17T15:34:58Z"
}
```

---

### PUT /api/admin/forms/{formId}
**Description**: Update form schema (admin only)

**Authentication**: Required (admin role)

**Path Parameters**:
- `formId`: Form identifier (string, required)

**Request Body**: Same as POST /api/admin/forms

**Response** (`200 OK`): Updated form details

---

### DELETE /api/admin/forms/{formId}
**Description**: Delete form schema (admin only)

**Authentication**: Required (admin role)

**Path Parameters**:
- `formId`: Form identifier (string, required)

**Response** (`200 OK`):
```json
{
  "message": "Form deleted successfully",
  "formId": "form-deleted"
}
```

---

### GET /api/admin/audit-logs
**Description**: View audit logs (admin only)

**Authentication**: Required (admin role)

**Query Parameters**:
- `actionType`: Filter by action type
- `entityType`: Filter by entity type (`form`, `submission`, `user`)
- `entityId`: Filter by entity ID
- `userId`: Filter by user ID
- `dateFrom`: Filter from date
- `dateTo`: Filter to date
- `page`: Page number
- `pageSize`: Items per page

**Response** (`200 OK`):
```json
{
  "logs": [
    {
      "id": "uuid-here",
      "actionType": "review",
      "entityType": "submission",
      "entityId": "SUB-20251117-001234",
      "userId": "admin@labuanfsa.gov.my",
      "userRole": "admin",
      "changes": {
        "status": {
          "from": "submitted",
          "to": "approved"
        }
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-11-17T16:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1000,
    "totalPages": 50
  }
}
```

---

### POST /api/admin/export
**Description**: Export submission data (admin only)

**Authentication**: Required (admin role)

**Request Body**:
```json
{
  "formIds": ["form-a", "form-b"],
  "status": ["submitted", "approved"],
  "dateFrom": "2025-01-01T00:00:00Z",
  "dateTo": "2025-12-31T23:59:59Z",
  "format": "csv" | "excel" | "pdf",
  "includeDocuments": true,
  "includeAuditTrail": false
}
```

**Response** (`200 OK` - CSV/Excel):
- Content-Type: `text/csv` or `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="submissions-20251117.csv"`
- Body: Export file data

**Response** (`202 Accepted` - PDF - Async):
```json
{
  "exportId": "EXP-20251117-001234",
  "status": "processing",
  "estimatedCompletion": "2025-11-17T16:05:00Z",
  "downloadUrl": "/api/admin/export/EXP-20251117-001234/download"
}
```

---

## 🔑 AUTHENTICATION API

### POST /api/auth/register
**Description**: User registration

**Authentication**: Not required

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "phoneNumber": "+60123456789",
  "acceptTerms": true
}
```

**Response** (`201 Created`):
```json
{
  "message": "Registration successful. Please check your email for verification.",
  "userId": "uuid-here",
  "email": "user@example.com"
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already exists

---

### POST /api/auth/login
**Description**: User login

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": false
}
```

**Response** (`200 OK`):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-here",
  "tokenType": "Bearer",
  "expiresIn": 1800,
  "user": {
    "userId": "uuid-here",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Too many login attempts

---

### POST /api/auth/logout
**Description**: User logout

**Authentication**: Required

**Response** (`200 OK`):
```json
{
  "message": "Logged out successfully"
}
```

---

### POST /api/auth/refresh
**Description**: Refresh access token

**Authentication**: Not required (refresh token in body)

**Request Body**:
```json
{
  "refreshToken": "refresh-token-here"
}
```

**Response** (`200 OK`):
```json
{
  "accessToken": "new-access-token",
  "tokenType": "Bearer",
  "expiresIn": 1800
}
```

---

### GET /api/auth/me
**Description**: Get current user information

**Authentication**: Required

**Response** (`200 OK`):
```json
{
  "userId": "uuid-here",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "user",
  "phoneNumber": "+60123456789",
  "createdAt": "2025-11-17T15:34:58Z"
}
```

---

## 📊 ERROR RESPONSES

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "field-name",
      "reason": "Specific error reason"
    }
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `CONFLICT`: Resource conflict (e.g., already exists)
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

---

## 🚦 RATE LIMITING

**Rate Limits**:
- **Public Endpoints**: 100 requests/hour per IP
- **Authenticated Endpoints**: 1000 requests/hour per user
- **File Upload**: 20 uploads/hour per user
- **Admin Endpoints**: 5000 requests/hour per admin

**Rate Limit Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1234567890
```

---

**Document Status**: ✅ Complete  
**Next Phase**: Database Schema SQL  
**Last Updated**: 2025-11-17 15:34:58

