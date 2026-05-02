import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from app.database import database
from app.models.user import User
from app.utils.hash import hash_password, verify_password
from app.utils.jwt_handler import create_token
from app.utils.email_sender import send_verification_email
import secrets

router = APIRouter(prefix="/auth", tags=["Auth"])


# Register
@router.post("/register")
def register(user: User):

    existing = database.users.find_one({"email": user.email})

    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    user_dict = user.dict()
    user_dict["password"] = hash_password(user.password)

    user_dict["is_verified"] = False
    user_dict["verify_token"] = secrets.token_hex(16)

    database.users.insert_one(user_dict)

    send_verification_email(
        user.email,
        user_dict["verify_token"]
    )

    return {
        "message": "User Registered Successfully",
        "verify_token": user_dict["verify_token"]
    }


# VERIFY EMAIL
@router.get("/verify/{token}", response_class=HTMLResponse)
def verify_email(token: str):

    user = database.users.find_one({"verify_token": token})

    if not user:
        frontend_public_url = os.getenv("FRONTEND_PUBLIC_URL", "http://127.0.0.1:5173").rstrip("/")
        return f"""
        <html>
        <head>
            <title>Invalid Link</title>
        </head>
        <body style="font-family:Arial; text-align:center; padding-top:100px; background:#f8f9fa;">
            <h1 style="color:red;">❌ Invalid or Expired Verification Link</h1>
            <p>If you already verified your email, you can go to the login page.</p>
            <a href=\"{frontend_public_url}/login\" style=\"display:inline-block;margin-top:20px;padding:12px 25px;background:#0072ff;color:white;text-decoration:none;border-radius:10px;font-weight:bold;\">Login</a>
        </body>
        </html>
        """

    database.users.update_one(
        {"verify_token": token},
        {
            "$set": {"is_verified": True},
            "$unset": {"verify_token": ""}
        }
    )

    frontend_public_url = os.getenv("FRONTEND_PUBLIC_URL", "http://127.0.0.1:5173").rstrip("/")

    return f"""
    <html>
    <head>
        <title>Email Verified</title>
        <meta http-equiv="refresh" content="4;url={frontend_public_url}/login">
    </head>

    <body style="
        margin:0;
        padding:0;
        background:linear-gradient(135deg,#00c6ff,#0072ff);
        font-family:Arial;
        height:100vh;
        display:flex;
        justify-content:center;
        align-items:center;
    ">

        <div style="
            background:white;
            padding:50px;
            border-radius:20px;
            box-shadow:0 15px 35px rgba(0,0,0,0.2);
            text-align:center;
            width:420px;
        ">

            <h1 style="color:green; font-size:32px;">
                ✅ Verified Successfully
            </h1>

            <p style="font-size:18px; color:#333;">
                Your Email Verification Successful
            </p>

            <p style="color:gray;">
                Redirecting to Login Page in 4 seconds...
            </p>

            <a href="http://127.0.0.1:5173/login"
               style="
               display:inline-block;
               margin-top:20px;
               padding:12px 25px;
               background:#0072ff;
               color:white;
               text-decoration:none;
               border-radius:10px;
               font-weight:bold;
               ">
               Login Now
            </a>

        </div>

    </body>
    </html>
    """


# Login
@router.post("/login")
def login(data: dict):

    email = data.get("email")
    password = data.get("password")

    user = database.users.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.get("is_verified", False):
        raise HTTPException(status_code=401, detail="Please verify email first")

    if not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid Password")

    token = create_token({
        "email": user["email"],
        "role": user["role"]
    })

    return {
        "message": "Login Success",
        "token": token,
        "role": user["role"],
        "name": user["name"],
        "email": user["email"]
    }