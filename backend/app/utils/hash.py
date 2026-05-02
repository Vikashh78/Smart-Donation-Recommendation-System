from passlib.context import CryptContext

# Prefer pbkdf2_sha256 for stable cross-platform behavior (especially on Python 3.13).
# Keep bcrypt for verifying any previously stored hashes.
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256", "bcrypt"],
    deprecated="auto",
)

def hash_password(password):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)