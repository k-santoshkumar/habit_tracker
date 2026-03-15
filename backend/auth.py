import os
import re
import bcrypt
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from backend.database import db
from backend.schemas import TokenData, UserInDB

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "b4f2c8e1a9d7c5b3a1f0e2d4c6b8a0d2e4f6g8h0j2k4l6m8n0o2p4q6r8s0t2u")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def is_valid_email(email: str):
    email = email.lower().strip()
    # Robust email regex
    regex = r'^[a-z0-9](-?[a-z0-9._%+-])*@[a-z0-9](-?[a-z0-9])*\.[a-z]{2,10}$'
    if not re.match(regex, email):
        return False
    
    domain = email.split('@')[-1]
    disposable_providers = ["mailinator.com", "tempmail.com", "yopmail.com", "guerrillamail.com"]
    if domain in disposable_providers:
        return False

    # Legit check
    legit_domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "me.com"]
    if domain in legit_domains:
        return True
    
    return True

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    user = await db.users.find_one({"email": token_data.email})
    if user is None:
        raise credentials_exception
        
    user["id"] = str(user["_id"])
    user.pop("_id", None)
    return UserInDB(**user)
