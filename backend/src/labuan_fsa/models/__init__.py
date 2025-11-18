"""
SQLAlchemy database models.

All models are defined here and imported from this module.
"""

from labuan_fsa.models.form import Form, FormVersion
from labuan_fsa.models.submission import FormSubmission, FileUpload
from labuan_fsa.models.user import User
from labuan_fsa.models.audit import AuditLog

# Payment model - import if exists
try:
    from labuan_fsa.models.payment import Payment
    __all__ = [
        "Form",
        "FormVersion",
        "FormSubmission",
        "FileUpload",
        "User",
        "AuditLog",
        "Payment",
    ]
except ImportError:
    # Payment model might not exist yet
    __all__ = [
        "Form",
        "FormVersion",
        "FormSubmission",
        "FileUpload",
        "User",
        "AuditLog",
    ]

