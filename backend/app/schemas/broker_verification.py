from typing import Optional

from pydantic import BaseModel


class BrokerVerificationSubmit(BaseModel):
    pan_number: str
    business_name: str
    rera_registration_number: Optional[str] = None
    firm_name: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None