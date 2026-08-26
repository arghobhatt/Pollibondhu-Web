from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.orm import User
from app.api.deps import get_current_active_user
from app.schemas.citizen import (
    ServiceCategoryDTO,
    SubServiceDTO,
    ServiceApplicationCreateDTO,
    ServiceApplicationResponseDTO,
    SavedServiceDTO,
    UserNotificationDTO,
    CitizenStatsDTO
)
from app.services.citizen_service import citizen_service

router = APIRouter(tags=["Citizen Core Services"])

@router.get("/api/services/categories", response_model=List[ServiceCategoryDTO])
def get_categories():
    return citizen_service.get_service_categories()

@router.get("/api/services/{service_id}", response_model=SubServiceDTO)
def get_service(service_id: str):
    sub = citizen_service.get_service_by_id(service_id)
    if not sub:
        return SubServiceDTO(
            id=service_id,
            name_bn="বিশেষ সরকারি সেবা",
            name_en="Special Service",
            category_id="general",
            description_bn="পল্লীবন্ধু সমন্বিত ডিজিটাল নাগরিক সেবা।",
            fee_bdt=0.0,
            processing_days=3,
            required_documents=["জাতীয় পরিচয়পত্র (NID)"]
        )
    return sub

@router.post("/api/services/{service_id}/save", response_model=SavedServiceDTO)
def save_service(service_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return citizen_service.save_service(db, current_user, service_id)

@router.delete("/api/services/{service_id}/save")
def unsave_service(service_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return citizen_service.unsave_service(db, current_user, service_id)

@router.get("/api/services/saved/my-saved", response_model=List[SavedServiceDTO])
def get_saved_services(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return citizen_service.get_saved_services(db, current_user)

@router.post("/api/applications", response_model=ServiceApplicationResponseDTO, status_code=status.HTTP_201_CREATED)
async def create_application(req: ServiceApplicationCreateDTO, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return await citizen_service.apply_for_service(db, current_user, req)

@router.get("/api/applications/my-applications", response_model=List[ServiceApplicationResponseDTO])
def get_my_applications(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return citizen_service.get_user_applications(db, current_user)

@router.get("/api/applications/track/{tracking_query}", response_model=ServiceApplicationResponseDTO)
def track_application(tracking_query: str, db: Session = Depends(get_db)):
    return citizen_service.track_application(db, tracking_query)

@router.get("/api/applications/{application_id}", response_model=ServiceApplicationResponseDTO)
def get_application_details(application_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return citizen_service.get_application_by_id(db, application_id)

@router.get("/api/notifications", response_model=List[UserNotificationDTO])
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return citizen_service.get_user_notifications(db, current_user)

@router.put("/api/notifications/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return citizen_service.mark_notification_read(db, current_user, notification_id)

@router.get("/api/citizens/stats", response_model=CitizenStatsDTO)
def get_citizen_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return citizen_service.get_citizen_stats(db, current_user)
