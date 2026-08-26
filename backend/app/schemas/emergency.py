from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class EmergencyContactDTO(BaseModel):
    id: int
    title_bn: str
    category: str
    phone_number: str
    available_hours: str
    district: str
    description_bn: str
    icon_symbol: str
    created_at: datetime

    class Config:
        from_attributes = True

class EmergencyCategoryDTO(BaseModel):
    id: str
    name_bn: str
    icon: str
