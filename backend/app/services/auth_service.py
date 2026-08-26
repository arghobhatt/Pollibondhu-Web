from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.core.config import settings
from app.core.security import verify_password, hash_password, create_access_token
from app.models.orm import User, UserRole
from app.repositories.user_repository import user_repository
from app.schemas.auth import (
    UserRegisterDTO,
    UserLoginDTO,
    TokenResponseDTO,
    UserResponseDTO,
    ForgotPasswordDTO,
    ResetPasswordDTO,
    UserProfileUpdateDTO
)

class AuthService:
    def register_user(self, db: Session, req: UserRegisterDTO) -> TokenResponseDTO:
        existing_phone = user_repository.get_by_phone(db, req.phone_number)
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে।"
            )

        if req.email:
            existing_email = user_repository.get_by_email(db, req.email)
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে।"
                )

        user = User(
            full_name=req.full_name,
            phone_number=req.phone_number,
            email=req.email,
            nid_number=req.nid_number,
            role=req.role,
            division=req.division,
            district=req.district,
            upazila=req.upazila,
            password_hash=hash_password(req.password)
        )
        user_repository.create(db, user)

        access_token = create_access_token(data={"sub": str(user.id), "phone": user.phone_number, "role": user.role.value})
        user_dto = UserResponseDTO(
            id=user.id,
            full_name=user.full_name,
            phone_number=user.phone_number,
            email=user.email,
            nid_number=user.nid_number,
            role=user.role.value,
            division=user.division,
            district=user.district,
            upazila=user.upazila,
            avatar_url=user.avatar_url,
            is_active=user.is_active
        )
        return TokenResponseDTO(access_token=access_token, token_type="bearer", user=user_dto)

    def authenticate_user(self, db: Session, req: UserLoginDTO) -> TokenResponseDTO:
        user = user_repository.get_by_phone(db, req.phone_number)
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="মোবাইল নম্বর বা পাসওয়ার্ড ভুল হয়েছে।"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="আপনার একাউন্টটি নিষ্ক্রিয় করা হয়েছে।"
            )

        access_token = create_access_token(data={"sub": str(user.id), "phone": user.phone_number, "role": user.role.value})
        user_dto = UserResponseDTO(
            id=user.id,
            full_name=user.full_name,
            phone_number=user.phone_number,
            email=user.email,
            nid_number=user.nid_number,
            role=user.role.value,
            division=user.division,
            district=user.district,
            upazila=user.upazila,
            avatar_url=user.avatar_url,
            is_active=user.is_active
        )
        return TokenResponseDTO(access_token=access_token, token_type="bearer", user=user_dto)

    def update_user_profile(self, db: Session, user: User, req: UserProfileUpdateDTO) -> UserResponseDTO:
        if req.full_name is not None:
            user.full_name = req.full_name
        if req.email is not None:
            user.email = req.email
        if req.nid_number is not None:
            user.nid_number = req.nid_number
        if req.division is not None:
            user.division = req.division
        if req.district is not None:
            user.district = req.district
        if req.upazila is not None:
            user.upazila = req.upazila
        if req.avatar_url is not None:
            user.avatar_url = req.avatar_url
        db.commit()
        db.refresh(user)
        return UserResponseDTO.model_validate(user)

    def delete_user_account(self, db: Session, user: User) -> dict:
        db.delete(user)
        db.commit()
        return {
            "status": "success",
            "message": "আপনার অ্যাকাউন্টটি স্থায়ীভাবে মুছে ফেলা হয়েছে।"
        }

    def forgot_password(self, db: Session, req: ForgotPasswordDTO) -> dict:
        user = user_repository.get_by_phone(db, req.phone_number)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="এই মোবাইল নম্বর দিয়ে কোন একাউন্ট পাওয়া যায়নি।"
            )
        return {
            "status": "success",
            "message": f"পাসওয়ার্ড রিকভারি নির্দেশিকা SMS এর মাধ্যমে পাঠানো হয়েছে: {req.phone_number}"
        }

    def reset_password(self, db: Session, req: ResetPasswordDTO) -> dict:
        user = user_repository.get_by_phone(db, req.phone_number)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।"
            )
        
        if user.nid_number and user.nid_number != req.nid_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="পরিচয় যাচাইকরণ ব্যর্থ হয়েছে। NID নম্বর মিলেনি।"
            )

        user.password_hash = hash_password(req.new_password)
        db.commit()
        return {
            "status": "success",
            "message": "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। নতুন পাসওয়ার্ড দিয়ে প্রবেশ করুন।"
        }

auth_service = AuthService()
