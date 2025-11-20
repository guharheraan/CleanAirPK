from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings
import hashlib
import secrets

# Fallback to SHA256 if bcrypt has issues
pwd_context = CryptContext(
    schemes=["sha256_crypt", "bcrypt"], 
    deprecated="auto",
    sha256_crypt__default_rounds=30000
)

def verify_password(plain_password, hashed_password):
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fallback verification
        return hashed_password == get_password_hash_fallback(plain_password)

def get_password_hash(password):
    try:
        return pwd_context.hash(password)
    except Exception as e:
        print(f"Warning: Using fallback hashing due to: {e}")
        return get_password_hash_fallback(password)

def get_password_hash_fallback(password):
    """Fallback hashing method if bcrypt fails"""
    salt = "cleanairpk_salt_2024"  # In production, use a random salt per user
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt