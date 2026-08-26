from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class MarketPriceDTO(BaseModel):
    id: int
    crop_name: str
    crop_name_bn: str
    market_name: str
    district: str
    price_bdt_per_mon: float
    unit: str
    updated_at: datetime

    class Config:
        from_attributes = True

class MarketPriceCreateDTO(BaseModel):
    crop_name: str = Field(..., description="Crop name in English e.g. Aman Paddy")
    crop_name_bn: str = Field(..., description="Crop name in Bangla e.g. আমন ধান")
    market_name: str = Field(..., description="Market location e.g. ধামরাই বাজার")
    district: str = Field(..., description="District e.g. ঢাকা")
    price_bdt_per_mon: float = Field(..., gt=0, description="Price per mon in BDT")

class CropDiseaseDTO(BaseModel):
    id: int
    crop_name_bn: str
    crop_name_en: str
    disease_name_bn: str
    disease_name_en: str
    symptoms_bn: str
    treatment_bn: str
    prevention_bn: str
    image_symbol: str

    class Config:
        from_attributes = True

class AgriArticleDTO(BaseModel):
    id: int
    title_bn: str
    category: str
    summary_bn: str
    content_bn: str
    author: str
    created_at: datetime

    class Config:
        from_attributes = True

class AgriLoanApplicationCreateDTO(BaseModel):
    principal_amount: float = Field(..., gt=0, description="Loan principal amount in BDT")
    annual_interest_rate: float = Field(..., ge=0, description="Annual rate percentage")
    duration_months: int = Field(..., gt=0, description="Duration in months")
    scheme_type: str = Field("standard_emi", description="Scheme: 'standard_emi', 'seasonal_crop', or 'subsidy_loan'")
    applicant_name: str
    applicant_phone: str

class AgriLoanApplicationResponseDTO(BaseModel):
    id: int
    application_number: str
    scheme_type: str
    principal_amount: float
    total_repayment: float
    total_interest: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
