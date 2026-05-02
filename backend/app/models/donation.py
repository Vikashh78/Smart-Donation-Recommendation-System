from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Donation(BaseModel):
    donor_email: str
    item: str
    quantity: int
    location: str
    expiry_date: Optional[str] = None
    status: str = "available"  # available, matched, completed
    created_at: Optional[datetime] = None