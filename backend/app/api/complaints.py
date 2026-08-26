from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.orm import User
from app.api.deps import get_current_active_user, RoleChecker
from app.schemas.complaint import (
    ComplaintCreateDTO,
    ComplaintStatusUpdateDTO,
    ComplaintAssignDTO,
    ComplaintResponseDTO
)
from app.services.complaint_service import complaint_service

router = APIRouter(prefix="/api/complaints", tags=["Complaint Portal"])

@router.post("", response_model=ComplaintResponseDTO, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    req: ComplaintCreateDTO,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await complaint_service.create_complaint(db, current_user, req)

@router.get("/my-complaints", response_model=List[ComplaintResponseDTO])
def get_my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return complaint_service.get_user_complaints(db, current_user)

@router.get("", response_model=List[ComplaintResponseDTO])
def get_all_complaints(
    db: Session = Depends(get_db),
    current_officer: User = Depends(RoleChecker(["officer", "admin"]))
):
    return complaint_service.get_all_complaints(db)

@router.get("/{complaint_id}", response_model=ComplaintResponseDTO)
def get_complaint_details(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return complaint_service.get_complaint_by_id(db, complaint_id)

@router.put("/{complaint_id}/assign", response_model=ComplaintResponseDTO)
async def assign_officer(
    complaint_id: int,
    req: ComplaintAssignDTO,
    db: Session = Depends(get_db),
    current_officer: User = Depends(RoleChecker(["officer", "admin"]))
):
    return await complaint_service.assign_officer(db, complaint_id, req.officer_id, current_officer)

@router.put("/{complaint_id}/status", response_model=ComplaintResponseDTO)
async def update_complaint_status(
    complaint_id: int,
    req: ComplaintStatusUpdateDTO,
    db: Session = Depends(get_db),
    current_officer: User = Depends(RoleChecker(["officer", "admin"]))
):
    return await complaint_service.update_status(db, complaint_id, req, current_officer)
