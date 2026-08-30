from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.orm import User, ServiceApplication, CitizenComplaint, ApplicationStatus, ComplaintStatus
from app.schemas.officer import OfficerStatsDTO, ApplicationStatusUpdateDTO
from app.schemas.citizen import ServiceApplicationResponseDTO
from app.schemas.complaint import ComplaintResponseDTO
from app.services.events.publisher import application_event_publisher
from app.services.complaint_service import complaint_service

class OfficerService:
    def get_officer_stats(self, db: Session, officer: User) -> OfficerStatsDTO:
        app_q = db.query(ServiceApplication)
        total_apps = app_q.count()
        pending_apps = app_q.filter(ServiceApplication.status.in_([ApplicationStatus.PENDING, "Pending"])).count()
        approved_apps = app_q.filter(ServiceApplication.status.in_([ApplicationStatus.APPROVED, "Approved"])).count()

        comp_q = db.query(CitizenComplaint)
        total_comps = comp_q.count()
        pending_comps = comp_q.filter(
            CitizenComplaint.status.in_([ComplaintStatus.PENDING, ComplaintStatus.UNDER_INVESTIGATION, "Pending", "Under Investigation"])
        ).count()
        resolved_comps = comp_q.filter(
            CitizenComplaint.status.in_([ComplaintStatus.RESOLVED, "Resolved"])
        ).count()

        return OfficerStatsDTO(
            assigned_applications_count=total_apps,
            pending_applications_count=pending_apps,
            approved_applications_count=approved_apps,
            assigned_complaints_count=total_comps,
            pending_complaints_count=pending_comps,
            resolved_complaints_count=resolved_comps
        )

    def get_assigned_applications(
        self,
        db: Session,
        officer: User,
        status_filter: Optional[str] = None
    ) -> List[ServiceApplicationResponseDTO]:
        query = db.query(ServiceApplication)
        if status_filter and status_filter.strip() and status_filter.strip().lower() != "all":
            sf = status_filter.strip()
            status_map = {
                "pending": ApplicationStatus.PENDING,
                "in_progress": ApplicationStatus.IN_PROGRESS,
                "under_review": ApplicationStatus.IN_PROGRESS,
                "approved": ApplicationStatus.APPROVED,
                "rejected": ApplicationStatus.REJECTED,
                "Pending": ApplicationStatus.PENDING,
                "In Progress": ApplicationStatus.IN_PROGRESS,
                "Approved": ApplicationStatus.APPROVED,
                "Rejected": ApplicationStatus.REJECTED,
            }
            target = status_map.get(sf, sf)
            query = query.filter(ServiceApplication.status == target)

        apps = query.order_by(ServiceApplication.created_at.desc()).all()
        return [ServiceApplicationResponseDTO.model_validate(a) for a in apps]

    async def update_application_status(
        self,
        db: Session,
        officer: User,
        app_id: int,
        req: ApplicationStatusUpdateDTO
    ) -> ServiceApplicationResponseDTO:
        app_rec = db.query(ServiceApplication).filter(ServiceApplication.id == app_id).first()
        if not app_rec:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service application not found")

        status_mapping = {
            "approved": ApplicationStatus.APPROVED,
            "pending": ApplicationStatus.PENDING,
            "in_progress": ApplicationStatus.IN_PROGRESS,
            "under_review": ApplicationStatus.IN_PROGRESS,
            "rejected": ApplicationStatus.REJECTED,
            "Approved": ApplicationStatus.APPROVED,
            "Pending": ApplicationStatus.PENDING,
            "In Progress": ApplicationStatus.IN_PROGRESS,
            "Rejected": ApplicationStatus.REJECTED
        }
        target_status = status_mapping.get(req.status, req.status)

        old_status = app_rec.status
        app_rec.status = target_status
        app_rec.assigned_officer_id = officer.id
        if req.remarks:
            app_rec.remarks = req.remarks
        if req.payment_status:
            app_rec.payment_status = req.payment_status
        elif target_status == ApplicationStatus.APPROVED and app_rec.transaction_id and app_rec.payment_status == "Submitted":
            app_rec.payment_status = "Verified"

        db.commit()
        db.refresh(app_rec)

        await application_event_publisher.notify_status_change(app_rec, str(old_status), str(target_status), db)

        return ServiceApplicationResponseDTO.model_validate(app_rec)

    def get_assigned_complaints(
        self,
        db: Session,
        officer: User,
        status_filter: Optional[str] = None
    ) -> List[ComplaintResponseDTO]:
        return complaint_service.get_all_complaints(db, status_filter)

    async def update_complaint_status(
        self,
        db: Session,
        officer: User,
        complaint_id: int,
        new_status: str,
        remarks: Optional[str]
    ) -> ComplaintResponseDTO:
        from app.schemas.complaint import ComplaintStatusUpdateDTO
        req = ComplaintStatusUpdateDTO(new_status=new_status, resolution_notes=remarks)
        return await complaint_service.update_status(db, complaint_id, req, officer)

officer_service = OfficerService()
