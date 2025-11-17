"""
File upload schemas.

Pydantic schemas for file upload-related requests and responses.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class FileUploadResponse(BaseModel):
    """Schema for file upload response."""

    id: UUID
    file_id: str = Field(..., alias="id", description="File ID (UUID)")
    field_name: str
    file_name: str
    file_path: str
    file_size: int
    mime_type: Optional[str]
    storage_location: str
    storage_url: Optional[str]
    uploaded_at: datetime
    uploaded_by: Optional[str]

    class Config:
        from_attributes = True
        populate_by_name = True

