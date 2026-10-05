

from pydantic import BaseModel
from typing import Literal, Optional
from pydantic import BaseModel

class BrokerVerificationSummary(BaseModel):
    verification_id: str
    broker_id: str
    user_id: str
    full_name: str
    email: str
    business_name: Optional[str] = None
    status: str
    submitted_at: Optional[str] = None


class BrokerVerificationReview(BaseModel):
    status: Literal["verified", "rejected"]
    rejection_reason: Optional[str] = None