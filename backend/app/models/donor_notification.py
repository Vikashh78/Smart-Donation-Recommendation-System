from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DonorDetails(BaseModel):
    full_name: str
    phone: str
    alt_phone: Optional[str] = None
    address: str
    preferred_time: str
    delivery_method: str
    notes: Optional[str] = None

class DonorNotification(BaseModel):
    donor_email: str
    hospital_email: str
    request_id: str
    item: str
    quantity: int
    urgency: str
    deadline: Optional[str] = None
    hospital_id: Optional[str] = None
    donor_id: Optional[str] = None
    donation_id: Optional[str] = None
    hospital_name: Optional[str] = None
    status: str = "pending"  # pending, accepted, details_sent, completed
    sent_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    responded_at: Optional[datetime] = None
    donor_details: Optional[DonorDetails] = None
    completed_at: Optional[datetime] = None