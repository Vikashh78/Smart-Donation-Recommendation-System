from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional
from app.database import database
from app.models.request import Request
from app.models.donor_notification import DonorNotification
from app.models.accepted_match import AcceptedMatch
from app.utils.jwt_handler import decode_token
from bson import ObjectId
import datetime

router = APIRouter(prefix="/hospital", tags=["Hospital"])


def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    return payload


class SendRequestPayload(BaseModel):
    request_id: str
    donor_id: Optional[str] = None
    hospital_id: Optional[str] = None
    hospital_email: Optional[str] = None
    hospital_name: Optional[str] = None
    resource_name: str
    quantity: int
    urgency: str
    needed_by: Optional[str] = None
    donor_email: Optional[str] = None
    donation_id: Optional[str] = None


# Post new request
@router.post("/request")
def request_item(request: Request):
    request_dict = request.dict()
    request_dict["created_at"] = datetime.datetime.utcnow()
    result = database.requests.insert_one(request_dict)
    return {"message": "Hospital Request Added Successfully", "request_id": str(result.inserted_id)}


# Get my requests
@router.get("/my-requests")
def get_my_requests(hospital_email: str):
    requests = list(database.requests.find({"hospital_email": hospital_email}))
    for req in requests:
        req["_id"] = str(req["_id"])
        # Count matches/notifications sent
        match_count = database.donor_notifications.count_documents({"request_id": str(req["_id"])})
        req["match_count"] = match_count
    return {"requests": requests}


# Get accepted requests with donor details
@router.get("/accepted-requests")
def get_accepted_requests(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "hospital":
        raise HTTPException(status_code=403, detail="Only hospital users may view accepted requests")

    hospital_email = current_user.get("email")

    # Get notifications that are accepted or have details sent
    notifications = list(database.donor_notifications.find({
        "hospital_email": hospital_email,
        "status": {"$in": ["accepted", "details_sent"]}
    }))

    accepted_requests = []
    for notif in notifications:
        notif["_id"] = str(notif["_id"])

        # Get request details
        request = database.requests.find_one({"_id": ObjectId(notif["request_id"])})
        if request:
            notif["request_details"] = {
                "item": request["item"],
                "quantity": request["quantity"],
                "urgency": request["urgency"],
                "deadline": request.get("deadline"),
                "location": request["location"]
            }

        # Get donor info
        donor_user = database.users.find_one({"email": notif["donor_email"], "role": "donor"})
        if donor_user:
            notif["donor_name"] = donor_user.get("name", "Donor")

        accepted_requests.append(notif)

    return {"accepted_requests": accepted_requests}


# Get matches for a specific request
@router.get("/request/{request_id}/matches")
def get_request_matches(request_id: str):
    # Get the request
    request = database.requests.find_one({"_id": ObjectId(request_id)})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Find matching donations
    donations = list(database.donations.find({
        "item": {"$regex": request["item"], "$options": "i"},
        "status": "available",
        "quantity": {"$gte": request["quantity"]}
    }))

    matches = []
    for donation in donations:
        # Calculate priority score (simplified)
        urgency_score = {"low": 1, "medium": 2, "high": 3, "critical": 4}.get(request["urgency"], 1)
        distance_score = 10  # Placeholder for distance calculation
        quantity_fit = min(donation["quantity"], request["quantity"]) / request["quantity"]
        priority_score = (urgency_score * 30) + (distance_score * 20) + (quantity_fit * 50)

        matches.append({
            "donation_id": str(donation["_id"]),
            "donor_email": donation["donor_email"],
            "item": donation["item"],
            "quantity": donation["quantity"],
            "location": donation["location"],
            "expiry_date": donation.get("expiry_date"),
            "priority_score": round(priority_score, 2),
            "estimated_delivery": "2-4 hours",  # Placeholder
            "response_rate": 85  # Placeholder
        })

    # Sort by priority score descending
    matches.sort(key=lambda x: x["priority_score"], reverse=True)
    return {"matches": matches}


# Send request to donor
@router.post("/send-request/{donation_id}")
def send_request_to_donor(
    donation_id: str,
    payload: SendRequestPayload,
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "hospital":
        raise HTTPException(status_code=403, detail="Only hospital users may send requests")

    hospital_email = payload.hospital_email or current_user.get("email")
    hospital_name = payload.hospital_name or current_user.get("name") or "Hospital"

    if not payload.request_id:
        raise HTTPException(status_code=400, detail="request_id is required")
    if not payload.resource_name:
        raise HTTPException(status_code=400, detail="resource_name is required")
    if payload.quantity is None:
        raise HTTPException(status_code=400, detail="quantity is required")
    if not payload.urgency:
        raise HTTPException(status_code=400, detail="urgency is required")

    request = database.requests.find_one({"_id": ObjectId(payload.request_id)})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if request.get("hospital_email") != hospital_email:
        raise HTTPException(status_code=403, detail="Request does not belong to authenticated hospital")

    donation = database.donations.find_one({"_id": ObjectId(donation_id)})
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    existing_notification = database.donor_notifications.find_one({
        "request_id": payload.request_id,
        "donor_email": donation["donor_email"],
        "hospital_email": hospital_email,
    })
    if existing_notification:
        raise HTTPException(status_code=400, detail="Request already sent")

    notification = DonorNotification(
        donor_email=donation["donor_email"],
        hospital_email=hospital_email,
        hospital_id=payload.hospital_id or current_user.get("email"),
        donor_id=payload.donor_id,
        donation_id=donation_id,
        request_id=payload.request_id,
        item=payload.resource_name,
        quantity=payload.quantity,
        urgency=payload.urgency,
        deadline=payload.needed_by or request.get("deadline"),
        hospital_name=hospital_name,
        status="pending",
        sent_at=datetime.datetime.utcnow(),
        created_at=datetime.datetime.utcnow()
    )

    database.donor_notifications.insert_one(notification.dict())

    database.requests.update_one(
        {"_id": ObjectId(payload.request_id)},
        {"$set": {"status": "sent"}}
    )

    return {"success": True, "message": "Request sent successfully"}


# Complete request
@router.post("/complete-request/{notification_id}")
def complete_request(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "hospital":
        raise HTTPException(status_code=403, detail="Only hospital users may complete requests")

    notification = database.donor_notifications.find_one({"_id": ObjectId(notification_id)})
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    if notification["hospital_email"] != current_user.get("email"):
        raise HTTPException(status_code=403, detail="Request does not belong to authenticated hospital")

    if notification["status"] != "details_sent":
        raise HTTPException(status_code=400, detail="Request must have donor details before completion")

    # Update notification status
    database.donor_notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"status": "completed", "completed_at": datetime.datetime.utcnow()}}
    )

    # Update request status
    database.requests.update_one(
        {"_id": ObjectId(notification["request_id"])},
        {"$set": {"status": "completed"}}
    )

    return {"message": "Request completed successfully"}


# Get completed requests history
@router.get("/history")
def get_hospital_history(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "hospital":
        raise HTTPException(status_code=403, detail="Only hospital users may view history")

    hospital_email = current_user.get("email")

    # Get completed notifications
    notifications = list(database.donor_notifications.find({
        "hospital_email": hospital_email,
        "status": "completed"
    }).sort("completed_at", -1))

    history = []
    for notif in notifications:
        notif["_id"] = str(notif["_id"])

        # Get request details
        request = database.requests.find_one({"_id": ObjectId(notif["request_id"])})
        if request:
            notif["request_details"] = {
                "item": request["item"],
                "quantity": request["quantity"],
                "urgency": request["urgency"],
                "deadline": request.get("deadline"),
                "location": request["location"]
            }

        # Get donor info
        donor_user = database.users.find_one({"email": notif["donor_email"], "role": "donor"})
        if donor_user:
            notif["donor_name"] = donor_user.get("name", "Donor")

        history.append(notif)

    return {"history": history}
