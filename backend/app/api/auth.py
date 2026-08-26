from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.orm import User
from app.schemas.auth import (
    UserRegisterDTO,
    UserLoginDTO,
    TokenResponseDTO,
    UserResponseDTO,
    ForgotPasswordDTO,
    ResetPasswordDTO,
    UserProfileUpdateDTO
)
from app.services.auth_service import auth_service
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponseDTO, status_code=status.HTTP_201_CREATED)
def register(req: UserRegisterDTO, db: Session = Depends(get_db)):
    return auth_service.register_user(db, req)

@router.post("/login", response_model=TokenResponseDTO)
def login(req: UserLoginDTO, db: Session = Depends(get_db)):
    return auth_service.authenticate_user(db, req)

@router.post("/logout")
def logout(current_user: User = Depends(get_current_active_user)):
    return {
        "status": "success",
        "message": f"User {current_user.phone_number} logged out successfully."
    }

@router.get("/me", response_model=UserResponseDTO)
def get_me(current_user: User = Depends(get_current_active_user)):
    return UserResponseDTO.model_validate(current_user)

@router.put("/me", response_model=UserResponseDTO)
def update_me(req: UserProfileUpdateDTO, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return auth_service.update_user_profile(db, current_user, req)

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordDTO, db: Session = Depends(get_db)):
    return auth_service.forgot_password(db, req)

@router.post("/reset-password")
def reset_password(req: ResetPasswordDTO, db: Session = Depends(get_db)):
    return auth_service.reset_password(db, req)
