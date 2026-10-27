from datetime import datetime, timezone
from typing import Optional, Dict, Any
from bson import ObjectId
from fastapi import HTTPException, status

from app.core.database import DatabaseManager
from app.core.security import verify_password, get_password_hash, create_access_token
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse

def register_citizen(req: UserRegisterRequest) -> TokenResponse:
    db = DatabaseManager.get_db()
    users_col = db.users

    # Check if email exists
    existing = users_col.find_one({"email": req.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    now = datetime.now(timezone.utc)
    user_doc = {
        "name": req.name.strip(),
        "email": req.email.lower().strip(),
        "password_hash": get_password_hash(req.password),
        "role": "citizen",  # Enforce citizen role, no privilege elevation
        "created_at": now,
        "updated_at": now,
    }

    res = users_col.insert_one(user_doc)
    user_id = str(res.inserted_id)

    token = create_access_token(
        data={"sub": user_id, "email": user_doc["email"], "role": user_doc["role"], "name": user_doc["name"]}
    )

    user_resp = UserResponse(
        id=user_id,
        name=user_doc["name"],
        email=user_doc["email"],
        role=user_doc["role"],
        created_at=user_doc["created_at"],
        updated_at=user_doc["updated_at"],
    )

    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)

def login_user(req: UserLoginRequest) -> TokenResponse:
    db = DatabaseManager.get_db()
    users_col = db.users

    user_doc = users_col.find_one({"email": req.email.lower().strip()})
    if not user_doc or not verify_password(req.password, user_doc.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = str(user_doc.get("_id"))
    token = create_access_token(
        data={"sub": user_id, "email": user_doc["email"], "role": user_doc.get("role", "citizen"), "name": user_doc.get("name")}
    )

    user_resp = UserResponse(
        id=user_id,
        name=user_doc.get("name", "User"),
        email=user_doc.get("email"),
        role=user_doc.get("role", "citizen"),
        created_at=user_doc.get("created_at", datetime.now(timezone.utc)),
        updated_at=user_doc.get("updated_at"),
    )

    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)

def get_user_by_id(user_id: str) -> Optional[UserResponse]:
    db = DatabaseManager.get_db()
    users_col = db.users
    try:
        user_doc = users_col.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user_doc = users_col.find_one({"_id": user_id})

    if not user_doc:
        return None

    return UserResponse(
        id=str(user_doc.get("_id")),
        name=user_doc.get("name", "User"),
        email=user_doc.get("email"),
        role=user_doc.get("role", "citizen"),
        created_at=user_doc.get("created_at", datetime.now(timezone.utc)),
        updated_at=user_doc.get("updated_at"),
    )

def change_user_password(user_id: str, current_pass: str, new_pass: str) -> bool:
    db = DatabaseManager.get_db()
    users_col = db.users
    try:
        query = {"_id": ObjectId(user_id)}
    except Exception:
        query = {"_id": user_id}

    user_doc = users_col.find_one(query)
    if not user_doc or not verify_password(current_pass, user_doc.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed.",
        )

    now = datetime.now(timezone.utc)
    users_col.update_one(query, {"$set": {"password_hash": get_password_hash(new_pass), "updated_at": now}})
    return True
