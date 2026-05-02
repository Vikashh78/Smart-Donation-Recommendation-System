import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os


def send_verification_email(to_email, token):
    backend_public_url = os.getenv(
        "BACKEND_PUBLIC_URL",
        "http://127.0.0.1:8000"
    ).rstrip("/")

    verify_link = f"{backend_public_url}/auth/verify/{token}"

    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASS")

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = "Verify Your Account"

    body = f"""
Hello,

Click below link to verify your account:

{verify_link}

Thank You
Smart Donation System
"""

    msg.attach(MIMEText(body, "plain"))

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(sender_email, sender_password)
    server.sendmail(sender_email, to_email, msg.as_string())
    server.quit()