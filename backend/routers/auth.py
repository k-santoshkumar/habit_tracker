from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from backend.auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    is_valid_email,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from backend.database import db
from backend.schemas import UserCreate, Token, UserInDB
from datetime import timedelta, datetime

router = APIRouter()

@router.post("/register", response_model=dict)
async def register(user: UserCreate):
    if not is_valid_email(user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address. Please use a legitimate email like @gmail.com"
        )
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    user_data = {
        "email": user.email.lower(),
        "full_name": user.full_name,
        "hashed_password": hashed_password,
        "created_at": datetime.now()
    }
    
    await db.users.insert_one(user_data)
    
    # Create access token immediately
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email.lower()}, expires_delta=access_token_expires
    )
    
    return {
        "success": True, 
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {"email": user.email, "full_name": user.full_name}
    }

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"email": form_data.username.lower()})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {
        "success": True,
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {"email": user["email"], "full_name": user.get("full_name")}
    }

@router.get("/me")
async def get_me(current_user: UserInDB = Depends(get_current_user)):
    return {"success": True, "data": current_user}
