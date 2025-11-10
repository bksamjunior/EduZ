from passlib.context import CryptContext

# Use a pure-Python hasher by default to avoid platform-specific bcrypt
# binary dependency issues during tests and in minimal environments.
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

def hash_password(password: str) -> str:
    # bcrypt has a 72-byte input limit. Truncate to avoid ValueError on long inputs
    try:
        if "bcrypt" in pwd_context.schemes():
            pw_bytes = password.encode("utf-8")[:72]
            password = pw_bytes.decode("utf-8", errors="ignore")
    except Exception:
        # fallback: use the original password if anything goes wrong
        pass
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    try:
        if "bcrypt" in pwd_context.schemes():
            pw_bytes = plain.encode("utf-8")[:72]
            plain = pw_bytes.decode("utf-8", errors="ignore")
    except Exception:
        pass
    return pwd_context.verify(plain, hashed)

from datetime import datetime, timedelta
from jose import JWTError, jwt
import os
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()  # Load from .env file

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-insecure-key")  # Use a strong value from .env in production

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")
