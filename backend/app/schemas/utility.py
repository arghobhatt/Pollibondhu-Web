from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class BillTypeDTO(BaseModel):
    id: str
    name_bn: str
    name_en: str
    biller_name_bn: str
    icon: str
    description_bn: str

class UtilityPaymentCreateDTO(BaseModel):
    bill_type: str = Field(..., description="Bill category: 'electricity', 'water_irrigation', 'trade_license', 'holding_tax'")
    account_number: str = Field(..., min_length=3, description="Meter no / SMS Account no / Holding no")
    amount_bdt: float = Field(..., gt=0, description="Bill amount in BDT")

class UtilityBillResponseDTO(BaseModel):
    id: int
    transaction_id: str
    user_id: int
    bill_type: str
    biller_name_bn: str
    account_number: str
    amount_bdt: float
    status: str
    paid_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
