import uuid

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class VerificationStatus(str, Enum):
    NOT_SUBMITTED = "not_submitted"
    UNDER_REVIEW = "under_review"
    VERIFIED = "verified"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class BrokerVerification(Base):
    __tablename__ = "broker_verifications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    broker_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("broker_profiles.id"),
        unique=True,
        nullable=False,
    )

    pan_number: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
    )

    business_name: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
    )

    rera_registration_number: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    firm_name: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
    )

    latitude: Mapped[Optional[str]] = mapped_column(
        String(30),
        nullable=True,
    )

    longitude: Mapped[Optional[str]] = mapped_column(
        String(30),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default=VerificationStatus.NOT_SUBMITTED.value,
        nullable=False,
    )

    rejection_reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    reviewed_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )

    submitted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    reviewed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )