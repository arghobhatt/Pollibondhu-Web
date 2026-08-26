from typing import Optional
from pydantic import BaseModel, Field

class UserRegisterDTO(BaseModel):
    full_name: str = Field(..., min_length=2, description="Applicant full name")
    phone_number: str = Field(..., min_length=11, description="Mobile number e.g. +8801812345678")
    email: Optional[str] = None
    nid_number: Optional[str] = None
    password: str = Field(..., min_length=6, description="Password min 6 characters")
    division: Optional[str] = None
    district: Optional[str] = None
    upazila: Optional[str] = None
    role: Optional[str] = "citizen"

class UserLoginDTO(BaseModel):
    phone_number: str = Field(..., description="Registered phone number")
    password: str = Field(..., description="Account password")

class UserResponseDTO(BaseModel):
    id: int
    full_name: str
    phone_number: str
    email: Optional[str] = None
    nid_number: Optional[str] = None
    role: str
    division: Optional[str] = None
    district: Optional[str] = None
    upazila: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

class TokenResponseDTO(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponseDTO

class ForgotPasswordDTO(BaseModel):
    phone_number: str = Field(..., description="Registered phone number for password recovery")

class ResetPasswordDTO(BaseModel):
    phone_number: str = Field(..., description="Registered phone number")
    nid_number: str = Field(..., description="National ID number for identity verification")
    new_password: str = Field(..., min_length=6, description="New password min 6 characters")
