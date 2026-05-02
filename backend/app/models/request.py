from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Request(BaseModel):
    hospital_email: str
    item: str
    quantity: int
    urgency: str
    location: str
    deadline: Optional[str] = None  # e.g., "2 hours", "today", "1 day", "3 days"
    notes: Optional[str] = ""
    status: str = "pending"  # pending, matching, sent, accepted, completed
    created_at: Optional[datetime] = None