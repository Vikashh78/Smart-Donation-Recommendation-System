from pydantic import BaseModel

class ApplyRequest(BaseModel):
    donation_id: str
    hospital_email: str
    status: str = "pending"