import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class PropertyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    property_type: str
    price: Decimal
    address: str
    pincode: str


class PropertyResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    property_type: str
    price: Decimal
    address: str
    pincode: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)