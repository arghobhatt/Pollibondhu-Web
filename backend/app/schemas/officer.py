from typing import Optional
from pydantic import BaseModel, Field

class OfficerStatsDTO(BaseModel):
    assigned_applications_count: int
    pending_applications_count: int
    approved_applications_count: int
    assigned_complaints_count: int
    pending_complaints_count: int
    resolved_complaints_count: int

class ApplicationStatusUpdateDTO(BaseModel):
    status: str = Field(..., description="New status: 'under_review', 'approved', 'rejected', 'Pending', 'In Progress', 'Approved', 'Rejected'")
    remarks: Optional[str] = Field(None, description="Officer notes/remarks")
    payment_status: Optional[str] = Field(None, description="Optional payment status update: 'Pending', 'Submitted', 'Verified', 'Failed/Rejected'")
