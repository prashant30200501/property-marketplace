
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class EnquiryResponse(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    property_id: uuid.UUID
    assigned_broker_id: Optional[uuid.UUID] = None
    status: str
    customer_message: Optional[str] = None

    created_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None

    property_title: Optional[str] = None
    property_type: Optional[str] = None
    property_price: Optional[Decimal] = None
    property_address: Optional[str] = None
    property_pincode: Optional[str] = None
    property_status: Optional[str] = None

    assigned_broker_name: Optional[str] = None
    assigned_broker_business_name: Optional[str] = None

    class Config:
        from_attributes = True
