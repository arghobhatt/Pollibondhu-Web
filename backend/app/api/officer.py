from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.orm import User
from app.api.deps import get_current_active_user, RoleChecker
from app.schemas.officer import OfficerStatsDTO, ApplicationStatusUpdateDTO
from app.schemas.citizen import ServiceApplicationResponseDTO
from app.schemas.complaint import ComplaintResponseDTO
from app.services.officer_service import officer_service

router = APIRouter(prefix="/api/officer", tags=["Officer Operations"])
officer_guard = Depends(RoleChecker(["officer", "admin"]))

@router.get("/stats", response_model=OfficerStatsDTO, dependencies=[officer_guard])
def get_officer_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return officer_service.get_officer_stats(db, current_user)

@router.get("/applications", response_model=List[ServiceApplicationResponseDTO], dependencies=[officer_guard])
def get_assigned_applications(
    status: Optional[str] = Query(None, description="Status filter: pending, under_review, approved, rejected"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return officer_service.get_assigned_applications(db, current_user, status)

@router.put("/applications/{app_id}/status", response_model=ServiceApplicationResponseDTO, dependencies=[officer_guard])
async def update_application_status(
    app_id: int,
    req: ApplicationStatusUpdateDTO,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await officer_service.update_application_status(db, current_user, app_id, req)

@router.get("/complaints", response_model=List[ComplaintResponseDTO], dependencies=[officer_guard])
def get_assigned_complaints(
    status: Optional[str] = Query(None, description="Status filter: Pending, Under Investigation, Resolved, Rejected"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return officer_service.get_assigned_complaints(db, current_user, status)

@router.put("/complaints/{complaint_id}/status", response_model=ComplaintResponseDTO, dependencies=[officer_guard])
async def update_complaint_status(
    complaint_id: int,
    req: ApplicationStatusUpdateDTO,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await officer_service.update_complaint_status(db, current_user, complaint_id, req.status, req.remarks)
