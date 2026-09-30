import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class EnquiryActivity(Base):
    __tablename__ = "enquiry_activities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # Enquiry this activity belongs to
    enquiry_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("enquiries.id"),
        nullable=False,
        index=True,
    )

    # User who performed the action
    performed_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    # Type of activity: status change, call, follow-up, etc.
    activity_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    # Status before and after a change
    old_status: Mapped[Optional[str]] = mapped_column(
        String(30),
        nullable=True,
    )

    new_status: Mapped[Optional[str]] = mapped_column(
        String(30),
        nullable=True,
    )

    # Additional notes about the activity
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )