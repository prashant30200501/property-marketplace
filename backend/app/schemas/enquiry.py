from typing import Optional
import uuid

from pydantic import BaseModel


class EnquiryCreate(BaseModel):
    property_id: uuid.UUID
    customer_message: Optional[str] = None


class EnquiryResponse(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    property_id: uuid.UUID
    assigned_broker_id: Optional[uuid.UUID] = None
    status: str
    customer_message: Optional[str] = None

    class Config:
        from_attributes = True