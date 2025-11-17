"""
Admin API endpoints.

Handles admin operations: submission review, form management, audit logs, analytics.
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from labuan_fsa.database import get_db
from labuan_fsa.models.submission import FormSubmission
from labuan_fsa.schemas.submission import SubmissionResponse, SubmissionUpdate

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/submissions", response_model=list[SubmissionResponse])
async def list_all_submissions(
    form_id: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
) -> list[SubmissionResponse]:
    """
    List all submissions (Admin only).

    Args:
        form_id: Filter by form ID
        status: Filter by status
        page: Page number
        page_size: Page size
        db: Database session

    Returns:
        List of submissions
    """
    # TODO: Add admin authentication check

    # Build query
    query = select(FormSubmission)

    # Apply filters
    if form_id:
        query = query.where(FormSubmission.form_id == form_id)
    if status:
        query = query.where(FormSubmission.status == status)

    # Execute query
    result = await db.execute(query)
    submissions = result.scalars().all()

    # Pagination
    start = (page - 1) * page_size
    end = start + page_size
    paginated_submissions = submissions[start:end]

    return [SubmissionResponse.model_validate(sub) for sub in paginated_submissions]


@router.put("/submissions/{submission_id}", response_model=SubmissionResponse)
async def review_submission(
    submission_id: str,
    update_data: SubmissionUpdate,
    db: AsyncSession = Depends(get_db),
) -> SubmissionResponse:
    """
    Review a submission (Admin only).

    Args:
        submission_id: Submission ID
        update_data: Update data (status, review_notes, requested_info)
        db: Database session

    Returns:
        Updated submission

    Raises:
        HTTPException: 404 if submission not found
    """
    # TODO: Add admin authentication check

    # Get submission
    result = await db.execute(
        select(FormSubmission).where(FormSubmission.submission_id == submission_id)
    )
    submission = result.scalar_one_or_none()

    if not submission:
        raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")

    # Update submission
    if update_data.status is not None:
        submission.status = update_data.status
    if update_data.review_notes is not None:
        submission.review_notes = update_data.review_notes
    if update_data.requested_info is not None:
        submission.requested_info = update_data.requested_info

    # TODO: Set reviewed_by and reviewed_at from authentication

    await db.commit()
    await db.refresh(submission)

    # TODO: Create audit log entry
    # TODO: Send notification email

    return SubmissionResponse.model_validate(submission)

