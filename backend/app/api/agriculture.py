from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.orm import User
from app.api.deps import get_current_active_user, RoleChecker
from app.schemas.agriculture import (
    MarketPriceDTO,
    MarketPriceCreateDTO,
    CropDiseaseDTO,
    AgriArticleDTO,
    AgriLoanApplicationCreateDTO,
    AgriLoanApplicationResponseDTO
)
from app.services.agriculture_service import agriculture_service

router = APIRouter(prefix="/api/agriculture", tags=["Agriculture Module"])

@router.get("/market-prices", response_model=List[MarketPriceDTO])
def get_market_prices(
    district: Optional[str] = Query(None),
    division: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return agriculture_service.get_market_prices(db, district=district, division=division)

@router.post("/market-prices", response_model=MarketPriceDTO, status_code=status.HTTP_201_CREATED)
def add_or_update_market_price(
    req: MarketPriceCreateDTO,
    db: Session = Depends(get_db),
    current_officer: User = Depends(RoleChecker(["officer", "admin"]))
):
    return agriculture_service.add_or_update_market_price(db, current_officer, req)

@router.get("/crop-doctor", response_model=List[CropDiseaseDTO])
def get_crop_diseases(crop_name: Optional[str] = Query(None), db: Session = Depends(get_db)):
    return agriculture_service.get_crop_diseases(db, crop_name)

@router.get("/crop-doctor/{disease_id}", response_model=CropDiseaseDTO)
def get_disease_detail(disease_id: int, db: Session = Depends(get_db)):
    return agriculture_service.get_disease_by_id(db, disease_id)

@router.get("/articles", response_model=List[AgriArticleDTO])
def get_agri_articles(category: Optional[str] = Query(None), db: Session = Depends(get_db)):
    return agriculture_service.get_articles(db, category)

@router.post("/loans/apply", response_model=AgriLoanApplicationResponseDTO, status_code=status.HTTP_201_CREATED)
async def apply_for_agri_loan(
    req: AgriLoanApplicationCreateDTO,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await agriculture_service.apply_for_agri_loan(db, current_user, req)
