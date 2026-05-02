from fastapi import APIRouter
from app.database import database

router = APIRouter(prefix="/match", tags=["Matching"])

@router.get("/")
def smart_match():

    donations = list(database.donations.find())
    requests = list(database.requests.find())

    urgency_score = {
        "critical": 4,
        "high": 3,
        "medium": 2,
        "low": 1
    }

    # Highest urgency first
    requests.sort(
        key=lambda x: urgency_score.get(x.get("urgency", "low"), 1),
        reverse=True
    )

    matches = []

    for req in requests:

        needed = req["quantity"]

        for donor in donations:

            if donor["item"].lower() == req["item"].lower() and donor["quantity"] > 0:

                allocate = min(needed, donor["quantity"])

                matches.append({
                    "hospital_email": req["hospital_email"],
                    "donor_email": donor["donor_email"],
                    "item": req["item"],
                    "allocated_quantity": allocate,
                    "urgency": req["urgency"]
                })

                donor["quantity"] -= allocate
                needed -= allocate

                if needed == 0:
                    break

    return {"matches": matches}