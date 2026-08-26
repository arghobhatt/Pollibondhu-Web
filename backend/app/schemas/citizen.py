from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class SubServiceDTO(BaseModel):
    id: str
    name_bn: str
    name_en: str
    category_id: str
    description_bn: str
    fee_bdt: float = 0.0
    processing_days: int = 3
    required_documents: List[str]

class ServiceCategoryDTO(BaseModel):
    id: str
    title_bn: str
    title_en: str
    icon: str
    description_bn: str
    sub_services: List[SubServiceDTO]

class ServiceApplicationCreateDTO(BaseModel):
    service_type: str = Field(..., description="Category key e.g. agri_loan, fertilizer_subsidy, citizen_certificate")
    sub_service_name: str = Field(..., description="Sub service name in Bangla e.g. সার ও বীজ ভর্তুকি কুপন")
    applicant_name: str = Field(..., min_length=2)
    applicant_phone: str = Field(..., min_length=11)
    remarks: Optional[str] = None
    attached_documents: Optional[str] = None

class AuditLogItemDTO(BaseModel):
    id: int
    action: str
    old_status: Optional[str] = None
    new_status: str
    performed_by: Optional[str] = None
    remarks: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class ServiceApplicationResponseDTO(BaseModel):
    id: int
    application_number: str
    user_id: int
    service_type: str
    sub_service_name: str
    status: str
    applicant_name: str
    applicant_phone: str
    remarks: Optional[str] = None
    attached_documents: Optional[str] = None
    assigned_officer_id: Optional[int] = None
    assigned_officer_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    history: List[AuditLogItemDTO] = []

    class Config:
        from_attributes = True

class SavedServiceDTO(BaseModel):
    id: int
    service_id: str
    service_name_bn: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserNotificationDTO(BaseModel):
    id: int
    title: str
    message: str
    channel: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class CitizenStatsDTO(BaseModel):
    total_applications: int
    pending_applications: int
    approved_applications: int
    saved_services_count: int
    unread_notifications_count: int
