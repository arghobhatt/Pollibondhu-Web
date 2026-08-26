from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.emergency import EmergencyContactDTO, EmergencyCategoryDTO
from app.services.emergency_service import emergency_service

router = APIRouter(prefix="/api/emergency", tags=["Emergency Services"])

@router.get("/contacts", response_model=List[EmergencyContactDTO])
def get_emergency_contacts(
    category: Optional[str] = Query(None, description="Category filter e.g. national, agriculture, fire, health"),
    district: Optional[str] = Query(None, description="District filter"),
    db: Session = Depends(get_db)
):
    return emergency_service.get_contacts(db, category, district)

@router.get("/categories", response_model=List[EmergencyCategoryDTO])
def get_emergency_categories():
    return emergency_service.get_categories()
