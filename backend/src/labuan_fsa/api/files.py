"""
File upload API endpoints.

Handles file uploads, downloads, and deletion.
"""

import os
import hashlib
from pathlib import Path
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from labuan_fsa.config import get_settings
from labuan_fsa.database import get_db
from labuan_fsa.models.submission import FileUpload as FileUploadModel
from labuan_fsa.schemas.file import FileUploadResponse
from labuan_fsa.utils.validators import validate_file_upload

router = APIRouter(prefix="/api/files", tags=["Files"])

settings = get_settings()


def get_file_hash(file_content: bytes) -> str:
    """Calculate SHA-256 hash of file content."""
    return hashlib.sha256(file_content).hexdigest()


async def save_file_locally(file: UploadFile, field_name: str) -> tuple[str, int]:
    """
    Save file to local storage.

    Returns:
        Tuple of (file_path, file_size)
    """
    # Create uploads directory if it doesn't exist
    upload_dir = Path(settings.storage.local_path)
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    file_extension = Path(file.filename).suffix if file.filename else ''
    unique_filename = f"{field_name}_{hashlib.sha256(file.filename.encode() if file.filename else b'').hexdigest()[:16]}{file_extension}"
    file_path = upload_dir / unique_filename

    # Save file
    file_content = await file.read()
    with open(file_path, 'wb') as f:
        f.write(file_content)

    file_size = len(file_content)
    return str(file_path.relative_to(Path.cwd())), file_size


@router.post("", response_model=FileUploadResponse, status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    field_name: str = ...,
    db: AsyncSession = Depends(get_db),
) -> FileUploadResponse:
    """
    Upload a file.

    Args:
        file: File to upload
        field_name: Form field name
        db: Database session

    Returns:
        File upload response with metadata

    Raises:
        HTTPException: 400 if file validation fails, 413 if file too large
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name is required")

    # Get file extension
    file_extension = Path(file.filename).suffix.lower()

    # Validate file
    file_content = await file.read()
    await file.seek(0)  # Reset file pointer for saving

    is_valid, error_message = validate_file_upload(
        file_size=len(file_content),
        file_name=file.filename,
        allowed_extensions=settings.storage.allowed_extensions,
        max_size=settings.storage.max_file_size,
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail=error_message)

    # Calculate file hash
    file_hash = get_file_hash(file_content)

    # Save file (currently only local storage)
    if settings.storage.provider == 'local':
        file_path, file_size = await save_file_locally(file, field_name)
        storage_url = None
    else:
        # TODO: Implement cloud storage (S3, Azure, GCP)
        raise HTTPException(status_code=501, detail="Cloud storage not yet implemented")

    # Create FileUpload record (without submission_id for now - will be linked later)
    file_upload = FileUploadModel(
        submission_id=UUID('00000000-0000-0000-0000-000000000000'),  # Temporary UUID
        field_name=field_name,
        file_name=file.filename,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.content_type,
        storage_location=settings.storage.provider,
        storage_url=storage_url,
        file_hash=file_hash,
        uploaded_by=None,  # TODO: Get from authentication
    )

    db.add(file_upload)
    await db.commit()
    await db.refresh(file_upload)

    return FileUploadResponse(
        id=file_upload.id,
        file_id=str(file_upload.id),
        field_name=file_upload.field_name,
        file_name=file_upload.file_name,
        file_path=file_upload.file_path,
        file_size=file_upload.file_size,
        mime_type=file_upload.mime_type,
        storage_location=file_upload.storage_location,
        storage_url=file_upload.storage_url,
        uploaded_at=file_upload.uploaded_at,
        uploaded_by=file_upload.uploaded_by,
    )


@router.get("/{file_id}/download")
async def download_file(
    file_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Download a file.

    Args:
        file_id: File ID
        db: Database session

    Returns:
        File content

    Raises:
        HTTPException: 404 if file not found
    """
    result = await db.execute(select(FileUploadModel).where(FileUploadModel.id == file_id))
    file_upload = result.scalar_one_or_none()

    if not file_upload:
        raise HTTPException(status_code=404, detail=f"File not found: {file_id}")

    # TODO: Get file from storage (local or cloud)
    if settings.storage.provider == 'local':
        file_path = Path(file_upload.file_path)
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found on disk")

        from fastapi.responses import FileResponse

        return FileResponse(
            path=str(file_path),
            filename=file_upload.file_name,
            media_type=file_upload.mime_type,
        )
    else:
        # TODO: Implement cloud storage download
        raise HTTPException(status_code=501, detail="Cloud storage download not yet implemented")


@router.delete("/{file_id}", status_code=204)
async def delete_file(
    file_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a file.

    Args:
        file_id: File ID
        db: Database session

    Raises:
        HTTPException: 404 if file not found
    """
    result = await db.execute(select(FileUploadModel).where(FileUploadModel.id == file_id))
    file_upload = result.scalar_one_or_none()

    if not file_upload:
        raise HTTPException(status_code=404, detail=f"File not found: {file_id}")

    # Delete file from storage
    if settings.storage.provider == 'local':
        file_path = Path(file_upload.file_path)
        if file_path.exists():
            file_path.unlink()
    else:
        # TODO: Implement cloud storage deletion
        pass

    # Delete record
    await db.delete(file_upload)
    await db.commit()

    return None
