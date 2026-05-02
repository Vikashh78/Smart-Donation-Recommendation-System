from fastapi import APIRouter
from app.database import database
import joblib
import os
from fastapi import HTTPException

router = APIRouter(prefix="/recommend", tags=["ML Recommendation"])

# Get the directory of this file and construct the model path
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "..", "ml", "model.pkl")


def load_model():
    try:
        return joblib.load(model_path)
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Recommendation model unavailable: {exc}",
        ) from exc

urgency_map = {
    "low":1,
    "medium":2,
    "high":3,
    "critical":4
}

@router.get("/")
def recommend():
    model = load_model()

    requests = list(database.requests.find())

    result = []

    for req in requests:

        urgency_value = req.get("urgency", "low")
        urg = urgency_map.get(urgency_value.lower(),1)

        score = model.predict([[urg]])[0]

        result.append({
            "hospital_email": req["hospital_email"],
            "item": req["item"],
            "quantity": req["quantity"],
            "urgency": urgency_value,
            "priority_score": round(score,2)
        })

    result.sort(key=lambda x: x["priority_score"], reverse=True)

    return {"recommendations": result}