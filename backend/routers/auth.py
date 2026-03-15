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
from backend.schemas import UserCreate, UserInDB, UserPublic, UpdateUser
from datetime import timedelta, datetime

router = APIRouter()

def serialize_user(user: UserInDB | dict) -> UserPublic:
    if isinstance(user, UserInDB):
        return UserPublic.model_validate(user.model_dump())

    normalized_user = dict(user)
    if "_id" in normalized_user:
        normalized_user["id"] = str(normalized_user["_id"])
        normalized_user.pop("_id", None)
    return UserPublic.model_validate(normalized_user)

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
        "user": serialize_user({
            "email": user.email.lower(),
            "full_name": user.full_name
        })
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
        "user": serialize_user(user)
    }

@router.put("/me")
async def update_me(user_update: UpdateUser, current_user: UserInDB = Depends(get_current_user)):
    update_data = {}
    if user_update.full_name is not None:
        update_data["full_name"] = user_update.full_name
    if user_update.email is not None:
        if not is_valid_email(user_update.email):
            raise HTTPException(status_code=400, detail="Invalid email")
        # Check if new email is taken
        new_email = user_update.email.lower()
        if new_email != current_user.email:
            existing = await db.users.find_one({"email": user_update.email.lower()})
            if existing:
                raise HTTPException(status_code=400, detail="Email already taken")
            update_data["email"] = new_email
    
    if user_update.password:
        update_data["hashed_password"] = get_password_hash(user_update.password)
    
    if not update_data:
        public_user = serialize_user(current_user)
        return {"success": True, "message": "No changes made", "data": public_user, "user": public_user}
        
    await db.users.update_one({"email": current_user.email}, {"$set": update_data})
    updated_user = await db.users.find_one({"email": update_data.get("email", current_user.email)})
    public_user = serialize_user(updated_user)

    access_token = create_access_token(
        data={"sub": public_user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "success": True,
        "message": "Profile updated",
        "data": public_user,
        "user": public_user,
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me")
async def get_me(current_user: UserInDB = Depends(get_current_user)):
    return {"success": True, "data": serialize_user(current_user)}
