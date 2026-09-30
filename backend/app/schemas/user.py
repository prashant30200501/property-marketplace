import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str = "customer"
    pincode: Optional[str] = None


class UserResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    phone_verified: bool
    role: str
    pincode: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)