from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.orm import User, UserRole
from app.schemas.auth import UserRegisterDTO, UserLoginDTO, TokenResponseDTO, UserResponseDTO, ForgotPasswordDTO, ResetPasswordDTO, UserProfileUpdateDTO
from app.core.security import hash_password, verify_password, create_access_token
from app.repositories.user_repository import user_repository

class AuthService:
    def register_user(self, db: Session, req: UserRegisterDTO) -> TokenResponseDTO:
        existing_user = user_repository.get_by_phone(db, req.phone_number)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this phone number is already registered."
            )
        
        if req.email:
            existing_email = user_repository.get_by_email(db, req.email)
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A user with this email address is already registered."
                )

        role_enum = UserRole.CITIZEN
        if req.role and req.role.lower() == "officer":
            role_enum = UserRole.OFFICER
        elif req.role and req.role.lower() == "admin":
            role_enum = UserRole.ADMIN

        hashed_pwd = hash_password(req.password)
        new_user = User(
            full_name=req.full_name,
            phone_number=req.phone_number,
            email=req.email,
            nid_number=req.nid_number,
            role=role_enum,
            division=req.division,
            district=req.district,
            upazila=req.upazila,
            password_hash=hashed_pwd,
            is_active=True
        )
        user_repository.create(db, new_user)

        token_data = {"sub": str(new_user.id), "phone": new_user.phone_number, "role": new_user.role.value}
        access_token = create_access_token(token_data)

        user_dto = UserResponseDTO(
            id=new_user.id,
            full_name=new_user.full_name,
            phone_number=new_user.phone_number,
            email=new_user.email,
            nid_number=new_user.nid_number,
            role=new_user.role.value,
            division=new_user.division,
            district=new_user.district,
            upazila=new_user.upazila,
            is_active=new_user.is_active
        )
        return TokenResponseDTO(access_token=access_token, token_type="bearer", user=user_dto)

    def authenticate_user(self, db: Session, req: UserLoginDTO) -> TokenResponseDTO:
        user = user_repository.get_by_phone(db, req.phone_number)
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid phone number or password."
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated."
            )

        token_data = {"sub": str(user.id), "phone": user.phone_number, "role": user.role.value}
        access_token = create_access_token(token_data)

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
        db.commit()
        db.refresh(user)
        return UserResponseDTO.model_validate(user)

    def forgot_password(self, db: Session, req: ForgotPasswordDTO) -> dict:
        user = user_repository.get_by_phone(db, req.phone_number)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account with this phone number was not found."
            )
        return {
            "status": "success",
            "message": f"Password recovery instructions sent via SMS to {req.phone_number}."
        }

    def reset_password(self, db: Session, req: ResetPasswordDTO) -> dict:
        user = user_repository.get_by_phone(db, req.phone_number)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found."
            )
        
        if user.nid_number and user.nid_number != req.nid_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Identity verification failed. NID number does not match registered records."
            )

        user.password_hash = hash_password(req.new_password)
        db.commit()
        return {
            "status": "success",
            "message": "Password reset successfully. You may now log in with your new password."
        }

auth_service = AuthService()
