from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime, timezone

class WeatherDataDTO(BaseModel):
    city: str
    temperature_celsius: float
    humidity: int
    condition_bn: str
    wind_speed: float
    cached: bool = False
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NotificationRequestDTO(BaseModel):
    recipient: str = Field(..., description="Phone number, email address, or user ID")
    message: str = Field(..., description="Notification body content in Bangla/English")
    channel: str = Field(..., description="Delivery channel: 'sms', 'email', or 'push'")

class NotificationResponseDTO(BaseModel):
    success: bool
    channel: str
    recipient: str
    message_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LoanCalculationRequestDTO(BaseModel):
    principal: float = Field(..., gt=0, description="Loan principal amount in BDT (Taka)")
    annual_rate: float = Field(..., ge=0, description="Annual interest rate percentage")
    duration_months: int = Field(..., gt=0, description="Loan duration in months")
    scheme_type: str = Field("standard_emi", description="Strategy scheme: 'standard_emi', 'seasonal_crop', or 'subsidy_loan'")

class RepaymentScheduleItemDTO(BaseModel):
    period: int
    payment: float
    principal_component: float
    interest_component: float
    remaining_balance: float

class LoanCalculationResponseDTO(BaseModel):
    scheme_type: str
    principal: float
    total_repayment: float
    total_interest: float
    periodic_payment: float
    schedule: List[RepaymentScheduleItemDTO]

class ServiceApplicationDTO(BaseModel):
    application_id: str
    user_id: str
    sub_service_name: str
    applicant_name: str
    applicant_phone: str
    status: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusUpdateRequestDTO(BaseModel):
    application_id: str = Field(..., description="Application ID e.g. APP-2026-8801")
    new_status: str = Field(..., description="New status: Pending, In Progress, Approved, or Rejected")
    remarks: Optional[str] = Field(None, description="Optional administrative remarks")
