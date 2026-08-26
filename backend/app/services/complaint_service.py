import random
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.orm import (
    User,
    UserRole,
    CitizenComplaint,
    ComplaintStatus,
    AuditLog
)
from app.schemas.complaint import (
    ComplaintCreateDTO,
    ComplaintStatusUpdateDTO,
    ComplaintAssignDTO,
    ComplaintResponseDTO,
    ComplaintAuditLogDTO
)
from app.repositories.complaint_repository import complaint_repository
from app.services.events.publisher import application_event_publisher

class ComplaintService:
    async def create_complaint(self, db: Session, user: User, req: ComplaintCreateDTO) -> ComplaintResponseDTO:
        cmp_number = f"CMP-2026-{random.randint(1000, 9999)}"
        
        officer = db.query(User).filter(User.role == UserRole.OFFICER).first()
        officer_id = officer.id if officer else None

        new_cmp = CitizenComplaint(
            complaint_number=cmp_number,
            user_id=user.id,
            category=req.category,
            description=req.description,
            status=ComplaintStatus.PENDING,
            assigned_officer_id=officer_id
        )
        db.add(new_cmp)
        db.commit()
        db.refresh(new_cmp)

        audit_entry = AuditLog(
            complaint_id=new_cmp.id,
            action="Submitted",
            old_status=None,
            new_status=ComplaintStatus.PENDING.value,
            performed_by=user.full_name,
            remarks=f"নাগরিক অভিযোগ দাখিল করা হয়েছে ({req.category})"
        )
        db.add(audit_entry)
        db.commit()

        await application_event_publisher.notify_status_change(
            application_id=cmp_number,
            applicant_phone=user.phone_number,
            new_status=ComplaintStatus.PENDING.value,
            sub_service_name=f"অভিযোগ: {req.category}"
        )

        return self._build_complaint_dto(db, new_cmp)

    def get_user_complaints(self, db: Session, user: User) -> List[ComplaintResponseDTO]:
        cmps = db.query(CitizenComplaint).filter(CitizenComplaint.user_id == user.id).order_by(CitizenComplaint.created_at.desc()).all()
        return [self._build_complaint_dto(db, c) for c in cmps]

    def get_all_complaints(self, db: Session, status_filter: Optional[str] = None) -> List[ComplaintResponseDTO]:
        query = db.query(CitizenComplaint)
        if status_filter and status_filter.strip() and status_filter.strip() != "all":
            query = query.filter(CitizenComplaint.status == status_filter.strip())
        cmps = query.order_by(CitizenComplaint.created_at.desc()).all()
        return [self._build_complaint_dto(db, c) for c in cmps]

    def get_complaint_by_id(self, db: Session, complaint_id: int) -> ComplaintResponseDTO:
        cmp_rec = complaint_repository.get_by_id(db, complaint_id)
        if not cmp_rec:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint record not found")
        return self._build_complaint_dto(db, cmp_rec)

    async def assign_officer(self, db: Session, complaint_id: int, officer_id: int, performing_user: User) -> ComplaintResponseDTO:
        cmp_rec = complaint_repository.get_by_id(db, complaint_id)
        if not cmp_rec:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint record not found")
        
        target_officer = db.query(User).filter(User.id == officer_id).first()
        if not target_officer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target officer not found")

        cmp_rec.assigned_officer_id = target_officer.id
        
        audit_entry = AuditLog(
            complaint_id=cmp_rec.id,
            action="Officer Assigned",
            old_status=cmp_rec.status.value,
            new_status=cmp_rec.status.value,
            performed_by=performing_user.full_name,
            remarks=f"কর্মকর্তা {target_officer.full_name} কে দায়িত্ব অর্পণ করা হয়েছে"
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(cmp_rec)

        return self._build_complaint_dto(db, cmp_rec)

    async def update_status(self, db: Session, complaint_id: int, req: ComplaintStatusUpdateDTO, performing_user: User) -> ComplaintResponseDTO:
        cmp_rec = complaint_repository.get_by_id(db, complaint_id)
        if not cmp_rec:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint record not found")

        try:
            enum_status = ComplaintStatus(req.new_status)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid complaint status: {req.new_status}")

        old_status = cmp_rec.status.value
        cmp_rec.status = enum_status
        if req.resolution_notes:
            cmp_rec.resolution_notes = req.resolution_notes

        audit_entry = AuditLog(
            complaint_id=cmp_rec.id,
            action="Status Updated",
            old_status=old_status,
            new_status=enum_status.value,
            performed_by=performing_user.full_name,
            remarks=req.resolution_notes or f"অভিযোগের অবস্থা পরিবর্তিত হয়েছে -> {enum_status.value}"
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(cmp_rec)

        await application_event_publisher.notify_status_change(
            application_id=cmp_rec.complaint_number,
            applicant_phone=cmp_rec.complainant.phone_number if cmp_rec.complainant else "+8801800000000",
            new_status=enum_status.value,
            sub_service_name=f"অভিযোগ: {cmp_rec.category}"
        )

        return self._build_complaint_dto(db, cmp_rec)

    def _build_complaint_dto(self, db: Session, cmp_rec: CitizenComplaint) -> ComplaintResponseDTO:
        logs = db.query(AuditLog).filter(AuditLog.complaint_id == cmp_rec.id).order_by(AuditLog.timestamp.asc()).all()
        history_dtos = [ComplaintAuditLogDTO.model_validate(log) for log in logs]

        complainant_name = cmp_rec.complainant.full_name if cmp_rec.complainant else None
        complainant_phone = cmp_rec.complainant.phone_number if cmp_rec.complainant else None

        officer_name = None
        if cmp_rec.assigned_officer_id:
            officer = db.query(User).filter(User.id == cmp_rec.assigned_officer_id).first()
            if officer:
                officer_name = officer.full_name

        return ComplaintResponseDTO(
            id=cmp_rec.id,
            complaint_number=cmp_rec.complaint_number,
            user_id=cmp_rec.user_id,
            complainant_name=complainant_name,
            complainant_phone=complainant_phone,
            category=cmp_rec.category,
            description=cmp_rec.description,
            status=cmp_rec.status.value,
            assigned_officer_id=cmp_rec.assigned_officer_id,
            assigned_officer_name=officer_name,
            resolution_notes=cmp_rec.resolution_notes,
            created_at=cmp_rec.created_at,
            updated_at=cmp_rec.updated_at,
            history=history_dtos
        )

complaint_service = ComplaintService()
