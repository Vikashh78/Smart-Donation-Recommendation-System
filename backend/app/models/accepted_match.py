from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AcceptedMatch(BaseModel):
    donor_email: str
    hospital_email: str
    request_id: str
    donation_id: str
    item: str
    quantity: int
    status: str = "accepted"  # accepted, in_delivery, completed, cancelled
    accepted_at: Optional[datetime] = None
    delivery_status: Optional[str] = None
    completed_at: Optional[datetime] = None