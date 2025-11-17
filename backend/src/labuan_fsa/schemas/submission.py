"""
Submission schemas.

Pydantic schemas for submission-related requests and responses.
"""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class SubmissionValidateRequest(BaseModel):
    """Schema for validating submission data."""

    data: dict[str, Any] = Field(..., description="Form data organized by step")
    step_id: Optional[str] = Field(None, description="Specific step to validate")


class ValidationError(BaseModel):
    """Schema for validation error."""

    field_id: str
    field_name: str
    step_id: Optional[str] = None
    error: str
    error_code: str


class SubmissionValidateResponse(BaseModel):
    """Schema for validation response."""

    valid: bool
    errors: list[ValidationError] = Field(default_factory=list)


class SubmissionCreate(BaseModel):
    """Schema for creating a submission."""

    data: dict[str, Any] = Field(..., description="Form data organized by step")
    files: Optional[list[dict[str, str]]] = Field(
        None, description="List of file uploads with fieldName, fileId, fileName"
    )


class SubmissionDraft(BaseModel):
    """Schema for saving a draft submission."""

    data: dict[str, Any] = Field(..., description="Form data organized by step")
    files: Optional[list[dict[str, str]]] = Field(
        None, description="List of file uploads with fieldName, fileId, fileName"
    )


class SubmissionUpdate(BaseModel):
    """Schema for updating a submission."""

    status: Optional[str] = None
    review_notes: Optional[str] = None
    requested_info: Optional[str] = None


class SubmissionResponse(BaseModel):
    """Schema for submission response."""

    id: UUID
    form_id: str
    submission_id: str
    status: str
    submitted_by: Optional[str]
    submitted_at: Optional[datetime]
    reviewed_by: Optional[str]
    reviewed_at: Optional[datetime]
    review_notes: Optional[str]
    requested_info: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SubmissionCreateResponse(BaseModel):
    """Schema for submission creation response."""

    form_id: str
    submission_id: str
    status: str
    message: str
    submitted_at: datetime
    estimated_review_time: Optional[str] = None

