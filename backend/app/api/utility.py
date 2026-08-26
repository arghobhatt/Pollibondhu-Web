from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.orm import User
from app.api.deps import get_current_active_user
from app.schemas.utility import BillTypeDTO, UtilityPaymentCreateDTO, UtilityBillResponseDTO
from app.services.utility_service import utility_service

router = APIRouter(prefix="/api/utility", tags=["Utility Services"])

@router.get("/bill-types", response_model=List[BillTypeDTO])
def get_bill_types():
    return utility_service.get_bill_types()

@router.post("/pay", response_model=UtilityBillResponseDTO, status_code=status.HTTP_201_CREATED)
def pay_bill(
    req: UtilityPaymentCreateDTO,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return utility_service.pay_bill(db, current_user, req)

@router.get("/my-bills", response_model=List[UtilityBillResponseDTO])
def get_my_bills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return utility_service.get_user_bills(db, current_user)

@router.get("/bills/{bill_id}", response_model=UtilityBillResponseDTO)
def get_bill_receipt(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return utility_service.get_bill_by_id(db, bill_id)
