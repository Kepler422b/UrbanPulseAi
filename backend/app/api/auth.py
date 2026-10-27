from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse,
    PasswordChangeRequest,
)
from app.services.auth_service import (
    register_citizen,
    login_user,
    get_user_by_id,
    change_user_password,
)
from app.core.security import get_current_user_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegisterRequest):
    return register_citizen(req)

@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest):
    return login_user(req)

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found.",
        )
    return user

@router.post("/change-password")
def change_password(
    req: PasswordChangeRequest,
    token_data: dict = Depends(get_current_user_token),
):
    user_id = token_data.get("sub")
    success = change_user_password(user_id, req.current_password, req.new_password)
    return {"message": "Password updated successfully."}
