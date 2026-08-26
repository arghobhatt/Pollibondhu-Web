from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class ComplaintCreateDTO(BaseModel):
    category: str = Field(..., description="Complaint category e.g. 'সার সংকট', 'দুর্নীতি', 'কৃষি সেচ', 'অন্যান্য'")
    description: str = Field(..., min_length=10, description="Detailed description of complaint")

class ComplaintStatusUpdateDTO(BaseModel):
    new_status: str = Field(..., description="New status: Pending, Under Investigation, Resolved, or Rejected")
    resolution_notes: Optional[str] = Field(None, description="Resolution notes from investigating officer")

class ComplaintAssignDTO(BaseModel):
    officer_id: int = Field(..., description="Officer user ID")

class ComplaintAuditLogDTO(BaseModel):
    id: int
    action: str
    old_status: Optional[str] = None
    new_status: str
    performed_by: Optional[str] = None
    remarks: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class ComplaintResponseDTO(BaseModel):
    id: int
    complaint_number: str
    user_id: int
    complainant_name: Optional[str] = None
    complainant_phone: Optional[str] = None
    category: str
    description: str
    status: str
    assigned_officer_id: Optional[int] = None
    assigned_officer_name: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    history: List[ComplaintAuditLogDTO] = []

    class Config:
        from_attributes = True
