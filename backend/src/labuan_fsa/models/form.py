"""
Form models.

Defines Form and FormVersion models for storing form definitions.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import Boolean, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from labuan_fsa.database import Base


class Form(Base):
    """Form definition model."""

    __tablename__ = "forms"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        server_default=func.gen_random_uuid(),
    )
    form_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    version: Mapped[str] = mapped_column(String(50), nullable=False, default="1.0.0")
    schema_data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    requires_auth: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    estimated_time: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    created_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    updated_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    submissions: Mapped[list["FormSubmission"]] = relationship(
        "FormSubmission",
        back_populates="form",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    versions: Mapped[list["FormVersion"]] = relationship(
        "FormVersion",
        back_populates="form",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Form(id={self.id}, form_id='{self.form_id}', name='{self.name}')>"


class FormVersion(Base):
    """Form version history model."""

    __tablename__ = "form_versions"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        server_default=func.gen_random_uuid(),
    )
    form_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    schema_data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), default=func.now(), nullable=False
    )
    created_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    change_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    form: Mapped["Form"] = relationship("Form", back_populates="versions", lazy="selectin")

    def __repr__(self) -> str:
        return f"<FormVersion(id={self.id}, form_id='{self.form_id}', version='{self.version}')>"

