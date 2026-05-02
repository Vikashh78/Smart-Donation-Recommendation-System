from fastapi import APIRouter, HTTPException
from app.database import database
from app.models.donation import Donation
from app.models.accepted_match import AcceptedMatch
from app.models.donor_notification import DonorDetails
from bson import ObjectId
import datetime

router = APIRouter(prefix="/donor", tags=["Donor"])


# Add donation
@router.post("/donate")
def donate(donation: Donation):
    donation_dict = donation.dict()
    donation_dict["created_at"] = datetime.datetime.utcnow()
    result = database.donations.insert_one(donation_dict)
    return {"message": "Donation Added Successfully", "donation_id": str(result.inserted_id)}


# Get incoming requests
@router.get("/incoming-requests")
def get_incoming_requests(donor_email: str):
    notifications = list(database.donor_notifications.find({"donor_email": donor_email}))
    for notif in notifications:
        notif["_id"] = str(notif["_id"])
        # Get request details
        request = database.requests.find_one({"_id": ObjectId(notif["request_id"])})
        notif["hospital_name"] = notif.get("hospital_name") or notif.get("hospital_email") or "Hospital"
        if request:
            notif["request_details"] = {
                "item": request["item"],
                "quantity": request["quantity"],
                "urgency": request["urgency"],
                "deadline": request.get("deadline"),
                "location": request["location"]
            }
    return {"requests": notifications}


# Accept request
@router.post("/accept/{notification_id}")
def accept_request(notification_id: str):
    notification = database.donor_notifications.find_one({"_id": ObjectId(notification_id)})
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    # Update notification
    database.donor_notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"status": "accepted", "responded_at": datetime.datetime.utcnow()}}
    )

    # Create accepted match
    match = AcceptedMatch(
        donor_email=notification["donor_email"],
        hospital_email=notification["hospital_email"],
        request_id=notification["request_id"],
        donation_id="",  # Would need to link to actual donation
        item=notification["item"],
        quantity=notification["quantity"],
        accepted_at=datetime.datetime.utcnow()
    )

    database.accepted_matches.insert_one(match.dict())

    # Update request status
    database.requests.update_one(
        {"_id": ObjectId(notification["request_id"])},
        {"$set": {"status": "accepted"}}
    )

    return {"message": "Request accepted successfully"}


# Reject request
@router.post("/reject/{notification_id}")
def reject_request(notification_id: str):
    database.donor_notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"status": "rejected", "responded_at": datetime.datetime.utcnow()}}
    )
    return {"message": "Request rejected"}


# Send delivery details
@router.post("/send-details/{notification_id}")
def send_delivery_details(notification_id: str, details: DonorDetails):
    notification = database.donor_notifications.find_one({"_id": ObjectId(notification_id)})
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    if notification["status"] != "accepted":
        raise HTTPException(status_code=400, detail="Request must be accepted before sending details")

    if notification.get("donor_details"):
        raise HTTPException(status_code=400, detail="Details already submitted")

    # Update notification with donor details
    database.donor_notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {
            "status": "details_sent",
            "donor_details": details.dict(),
            "responded_at": datetime.datetime.utcnow()
        }}
    )

    return {"message": "Delivery details sent successfully"}


# Get history (completed/rejected requests)
@router.get("/history")
def get_donor_history(donor_email: str):
    notifications = list(database.donor_notifications.find({
        "donor_email": donor_email,
        "status": {"$in": ["completed", "rejected"]}
    }).sort("completed_at", -1))
    
    for notif in notifications:
        notif["_id"] = str(notif["_id"])
        # Get request details
        request = database.requests.find_one({"_id": ObjectId(notif["request_id"])})
        notif["hospital_name"] = notif.get("hospital_name") or notif.get("hospital_email") or "Hospital"
        if request:
            notif["request_details"] = {
                "item": request["item"],
                "quantity": request["quantity"],
                "urgency": request["urgency"],
                "deadline": request.get("deadline"),
                "location": request["location"]
            }
    return {"history": notifications}