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
from labuan_fsa.models.form import Form
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
    from datetime import datetime
    submission.reviewed_at = datetime.utcnow()
    submission.reviewed_by = "admin"  # TODO: Replace with actual user ID from auth

    await db.commit()
    await db.refresh(submission)

    # TODO: Create audit log entry
    # TODO: Send notification email

    return SubmissionResponse.model_validate(submission)


@router.get("/statistics")
async def get_statistics(
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Get admin dashboard statistics.

    Args:
        db: Database session

    Returns:
        Statistics dictionary
    """
    # TODO: Add admin authentication check

    from sqlalchemy import func, case

    # Get total submissions
    total_result = await db.execute(select(func.count(FormSubmission.id)))
    total_submissions = total_result.scalar() or 0

    # Get submissions by status
    status_counts = await db.execute(
        select(
            FormSubmission.status,
            func.count(FormSubmission.id).label('count')
        ).group_by(FormSubmission.status)
    )
    status_dict = {row.status: row.count for row in status_counts}

    # Get recent activity (last 10 submissions)
    recent_result = await db.execute(
        select(FormSubmission)
        .order_by(FormSubmission.created_at.desc())
        .limit(10)
    )
    recent_submissions = recent_result.scalars().all()

    # Get total forms
    forms_result = await db.execute(select(func.count(Form.id)))
    total_forms = forms_result.scalar() or 0

    # Build recent activity
    recent_activity = [
        {
            "id": sub.submission_id,
            "type": "submission",
            "description": f"New submission {sub.submission_id} for form {sub.form_id}",
            "timestamp": sub.submitted_at.isoformat() if sub.submitted_at else sub.created_at.isoformat(),
        }
        for sub in recent_submissions
    ]

    return {
        "totalSubmissions": total_submissions,
        "pendingSubmissions": status_dict.get("under-review", 0),
        "approvedSubmissions": status_dict.get("approved", 0),
        "rejectedSubmissions": status_dict.get("rejected", 0),
        "totalForms": total_forms,
        "recentActivity": recent_activity,
    }


@router.post("/seed-sample-form")
async def seed_sample_form_endpoint(
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Seed sample Labuan Company Management License form (Temporary endpoint).
    
    This endpoint creates the sample form in the production database.
    TODO: Add admin authentication check and remove after production setup.
    """
    from labuan_fsa.models.form import Form
    
    # Import the schema creation function
    import sys
    from pathlib import Path
    backend_dir = Path(__file__).parent.parent.parent.parent
    sys.path.insert(0, str(backend_dir / "scripts"))
    
    from seed_sample_form import create_labuan_company_management_form_schema
    
    form_id = "labuan-company-management-license"
    
    # Check if form already exists
    result = await db.execute(select(Form).where(Form.form_id == form_id))
    existing_form = result.scalar_one_or_none()
    
    schema_data = create_labuan_company_management_form_schema()
    
    if existing_form:
        existing_form.name = schema_data["formName"]
        existing_form.description = "Application for Licence to Carry on Labuan Company Management Business under Sections 131, Labuan Financial Services and Securities Act 2010"
        existing_form.category = "Licensing"
        existing_form.version = schema_data["version"]
        existing_form.schema_data = schema_data
        existing_form.is_active = True
        existing_form.requires_auth = True
        existing_form.estimated_time = "2-3 hours"
        await db.commit()
        return {"status": "success", "message": f"Form '{form_id}' updated", "formId": form_id}
    else:
        new_form = Form(
            form_id=form_id,
            name=schema_data["formName"],
            description="Application for Licence to Carry on Labuan Company Management Business under Sections 131, Labuan Financial Services and Securities Act 2010",
            category="Licensing",
            version=schema_data["version"],
            schema_data=schema_data,
            is_active=True,
            requires_auth=True,
            estimated_time="2-3 hours",
        )
        db.add(new_form)
        await db.commit()
        await db.refresh(new_form)
        return {"status": "success", "message": f"Form '{form_id}' created", "formId": form_id}

