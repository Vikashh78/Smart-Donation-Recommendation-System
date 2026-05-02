from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError
from app.routes import auth, donor, hospital, match
from app.routes import recommend

app = FastAPI(title="Smart Donation Recommendation System")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROUTERS
app.include_router(auth.router)
app.include_router(donor.router)
app.include_router(hospital.router)
app.include_router(match.router)
app.include_router(recommend.router)


@app.exception_handler(ServerSelectionTimeoutError)
async def mongo_timeout_handler(request, exc):
    return JSONResponse(
        status_code=503,
        content={"detail": "Database unavailable. Please try again in a moment."},
    )


@app.exception_handler(PyMongoError)
async def mongo_error_handler(request, exc):
    return JSONResponse(
        status_code=503,
        content={"detail": "Database error. Please try again later."},
    )


# HOME
@app.get("/")
def home():
    return {"message": "Backend Running Successfully"}