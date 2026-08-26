import random
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.orm import (
    User,
    UserRole,
    ServiceApplication,
    ApplicationStatus,
    AuditLog,
    SavedService,
    Notification
)
from app.schemas.citizen import (
    ServiceCategoryDTO,
    SubServiceDTO,
    ServiceApplicationCreateDTO,
    ServiceApplicationResponseDTO,
    SavedServiceDTO,
    UserNotificationDTO,
    CitizenStatsDTO,
    AuditLogItemDTO
)
from app.repositories.application_repository import application_repository
from app.services.events.publisher import application_event_publisher

class CitizenService:
    def get_service_categories(self) -> List[ServiceCategoryDTO]:
        return [
            ServiceCategoryDTO(
                id="agriculture",
                title_bn="কৃষি ও খামার সেবা",
                title_en="Agriculture & Farming Services",
                icon="🌾",
                description_bn="কৃষি ঋণ, সার-বীজ ভর্তুকি, এবং সেচ যন্ত্রপাতি সহায়তা সেবা।",
                sub_services=[
                    SubServiceDTO(
                        id="agri_loan",
                        name_bn="কৃষি ঋণ ও কিস্তি সহায়তা",
                        name_en="Subsidized Agri Loan",
                        category_id="agriculture",
                        description_bn="৪% সরকারি ভর্তুকিযুক্ত এবং শস্য উৎপাদনকালীন কিস্তিমুক্ত ঋণ।",
                        fee_bdt=0.0,
                        processing_days=7,
                        required_documents=["জাতীয় পরিচয়পত্র (NID)", "কৃষক কার্ড", "জমির খতিয়ান / লিজ চুক্তি"]
                    ),
                    SubServiceDTO(
                        id="fertilizer_subsidy",
                        name_bn="সার ও বীজ ভর্তুকি কুপন",
                        name_en="Fertilizer & Seed Subsidy",
                        category_id="agriculture",
                        description_bn="বিসিআইসি নিবন্ধিত ডিলারের নিকট থেকে ন্যায্যমূল্যে সার ও উচ্চ ফলনশীল বীজ সংগ্রহ।",
                        fee_bdt=0.0,
                        processing_days=3,
                        required_documents=["কৃষক আইডি কার্ড", "মোবাইল নম্বর"]
                    ),
                    SubServiceDTO(
                        id="machinery_grant",
                        name_bn="কৃষি যন্ত্রপাতি উন্নয়ন অনুদান",
                        name_en="Agri Machinery Development Subsidy",
                        category_id="agriculture",
                        description_bn="কম্বাইন হারভেস্টার ও পাওয়ার টিলার ক্রয়ে ৫০% সরকারি অনুদান।",
                        fee_bdt=100.0,
                        processing_days=15,
                        required_documents=["NID", "ব্যাংক অ্যাকাউন্ট তথ্য", "কৃষক গ্রুপের অঙ্গীকারনামা"]
                    )
                ]
            ),
            ServiceCategoryDTO(
                id="governance",
                title_bn="নাগরিক সনদ ও সরকারি সহায়তা",
                title_en="Citizen Governance & Certificates",
                icon="📜",
                description_bn="চারিত্রিক সনদ, উত্তরাধিকার সনদ, ভিজিডি খাদ্য সহায়তা এবং প্রত্যয়নপত্র।",
                sub_services=[
                    SubServiceDTO(
                        id="citizen_certificate",
                        name_bn="নাগরিকত্ব ও চারিত্রিক সনদ",
                        name_en="Citizenship & Character Certificate",
                        category_id="governance",
                        description_bn="ইউনিয়ন পরিষদ চেয়ারম্যান কর্তৃক ডিজিটাল নাগরিকত্ব ও চারিত্রিক সনদপত্র।",
                        fee_bdt=50.0,
                        processing_days=2,
                        required_documents=["NID / জন্ম নিবন্ধন", "সত্যায়িত পাসপোর্ট সাইজ ছবি"]
                    ),
                    SubServiceDTO(
                        id="vulnerable_group_feeding",
                        name_bn="ভিজিডি ও সামাজিক নিরাপত্তা ভিজিএফ",
                        name_en="VGD / Social Safety Net Support",
                        category_id="governance",
                        description_bn="দুস্থ ও অসচ্ছল গ্রামীণ পরিবারের জন্য মাসিক খাদ্য সহায়তা কার্ড।",
                        fee_bdt=0.0,
                        processing_days=10,
                        required_documents=["NID", "ইউপি চেয়ারম্যানের সুপারিশপত্র"]
                    )
                ]
            ),
            ServiceCategoryDTO(
                id="infrastructure",
                title_bn="গ্রামীণ অবকাঠামো ও দুর্যোগ সহায়তা",
                title_en="Infrastructure & Relief Services",
                icon="🏗️",
                description_bn="গভীর নলকূপ স্থাপন অনুমতি, বোরো সেচ অনুমোদন এবং বন্যা পুনর্বাসন।",
                sub_services=[
                    SubServiceDTO(
                        id="tube_well_permit",
                        name_bn="কৃষি সেচ নলকূপ লাইসেন্স",
                        name_en="Irrigation Tube-well Permit",
                        category_id="infrastructure",
                        description_bn="উপজেলা সেচ কমিটি অনুমোদিত গভীর ও অগভীর নলকূপ স্থাপনের লাইসেন্স।",
                        fee_bdt=200.0,
                        processing_days=14,
                        required_documents=["জমির খতিয়ান", "মৌজা ম্যাপ sketch", "NID"]
                    ),
                    SubServiceDTO(
                        id="flood_relief",
                        name_bn="জরুরি বন্যা ও প্রাকৃতিক দুর্যোগ ত্রাণ",
                        name_en="Emergency Disaster Relief",
                        category_id="infrastructure",
                        description_bn="প্রাকৃতিক দুর্যোগে ক্ষতিগ্রস্ত কৃষকদের বিন্যামূল্যে বীজ ও খাদ্য সহায়তা।",
                        fee_bdt=0.0,
                        processing_days=1,
                        required_documents=["ক্ষতিগ্রস্ত কৃষক তালিকা আইডি", "মোবাইল নম্বর"]
                    )
                ]
            )
        ]

    def get_service_by_id(self, service_id: str) -> Optional[SubServiceDTO]:
        categories = self.get_service_categories()
        for cat in categories:
            for sub in cat.sub_services:
                if sub.id == service_id:
                    return sub
        return None

    async def apply_for_service(self, db: Session, user: User, req: ServiceApplicationCreateDTO) -> ServiceApplicationResponseDTO:
        app_num = f"APP-2026-{random.randint(1000, 9999)}"
        
        officer = db.query(User).filter(User.role == UserRole.OFFICER).first()
        officer_id = officer.id if officer else None

        new_app = ServiceApplication(
            application_number=app_num,
            user_id=user.id,
            service_type=req.service_type,
            sub_service_name=req.sub_service_name,
            status=ApplicationStatus.PENDING,
            applicant_name=req.applicant_name or user.full_name,
            applicant_phone=req.applicant_phone or user.phone_number,
            remarks=req.remarks or "নতুন আবেদন জমা হয়েছে",
            assigned_officer_id=officer_id
        )
        db.add(new_app)
        db.commit()
        db.refresh(new_app)

        initial_audit = AuditLog(
            application_id=new_app.id,
            action="Submitted",
            old_status=None,
            new_status=ApplicationStatus.PENDING.value,
            performed_by=user.full_name,
            remarks="আবেদনকারী কর্তৃক অনলাইনে দাখিল করা হয়েছে"
        )
        db.add(initial_audit)
        
        user_notif = Notification(
            user_id=user.id,
            title="আবেদন সফলভাবে জমা হয়েছে",
            message=f"আপনার আবেদনটি সফলভাবে গৃহীত হয়েছে। ট্র্যাকিং নম্বর: {app_num}",
            channel="sms",
            is_read=False
        )
        db.add(user_notif)
        db.commit()

        await application_event_publisher.notify_status_change(
            application_id=app_num,
            applicant_phone=new_app.applicant_phone,
            new_status=ApplicationStatus.PENDING.value,
            sub_service_name=new_app.sub_service_name
        )

        return self._build_application_dto(db, new_app)

    def get_user_applications(self, db: Session, user: User) -> List[ServiceApplicationResponseDTO]:
        apps = db.query(ServiceApplication).filter(ServiceApplication.user_id == user.id).order_by(ServiceApplication.created_at.desc()).all()
        return [self._build_application_dto(db, app_rec) for app_rec in apps]

    def get_application_by_id(self, db: Session, application_id: int) -> ServiceApplicationResponseDTO:
        app_rec = application_repository.get_by_id(db, application_id)
        if not app_rec:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
        return self._build_application_dto(db, app_rec)

    def track_application(self, db: Session, tracking_query: str) -> ServiceApplicationResponseDTO:
        app_rec = db.query(ServiceApplication).filter(
            (ServiceApplication.application_number == tracking_query) | 
            (ServiceApplication.applicant_phone == tracking_query)
        ).first()
        if not app_rec:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No matching application found for tracking code")
        return self._build_application_dto(db, app_rec)

    def save_service(self, db: Session, user: User, service_id: str) -> SavedServiceDTO:
        existing = db.query(SavedService).filter(SavedService.user_id == user.id, SavedService.service_id == service_id).first()
        if existing:
            return SavedServiceDTO.model_validate(existing)
        
        service_info = self.get_service_by_id(service_id)
        name_bn = service_info.name_bn if service_info else service_id

        saved = SavedService(user_id=user.id, service_id=service_id, service_name_bn=name_bn)
        db.add(saved)
        db.commit()
        db.refresh(saved)
        return SavedServiceDTO.model_validate(saved)

    def unsave_service(self, db: Session, user: User, service_id: str) -> dict:
        db.query(SavedService).filter(SavedService.user_id == user.id, SavedService.service_id == service_id).delete()
        db.commit()
        return {"status": "success", "message": "Service removed from saved bookmarks"}

    def get_saved_services(self, db: Session, user: User) -> List[SavedServiceDTO]:
        saved_list = db.query(SavedService).filter(SavedService.user_id == user.id).all()
        return [SavedServiceDTO.model_validate(s) for s in saved_list]

    def get_user_notifications(self, db: Session, user: User) -> List[UserNotificationDTO]:
        notifs = db.query(Notification).filter(Notification.user_id == user.id).order_by(Notification.created_at.desc()).all()
        return [UserNotificationDTO.model_validate(n) for n in notifs]

    def mark_notification_read(self, db: Session, user: User, notification_id: int) -> dict:
        notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user.id).first()
        if notif:
            notif.is_read = True
            db.commit()
        return {"status": "success", "message": "Notification marked as read"}

    def mark_all_notifications_read(self, db: Session, user: User) -> dict:
        db.query(Notification).filter(Notification.user_id == user.id, Notification.is_read == False).update({"is_read": True})
        db.commit()
        return {"status": "success", "message": "All notifications marked as read"}

    def get_citizen_stats(self, db: Session, user: User) -> CitizenStatsDTO:
        apps = db.query(ServiceApplication).filter(ServiceApplication.user_id == user.id).all()
        total_apps = len(apps)
        pending = sum(1 for a in apps if a.status == ApplicationStatus.PENDING)
        approved = sum(1 for a in apps if a.status == ApplicationStatus.APPROVED)
        saved_count = db.query(SavedService).filter(SavedService.user_id == user.id).count()
        unread_count = db.query(Notification).filter(Notification.user_id == user.id, Notification.is_read == False).count()

        return CitizenStatsDTO(
            total_applications=total_apps,
            pending_applications=pending,
            approved_applications=approved,
            saved_services_count=saved_count,
            unread_notifications_count=unread_count
        )

    def _build_application_dto(self, db: Session, app_rec: ServiceApplication) -> ServiceApplicationResponseDTO:
        logs = db.query(AuditLog).filter(AuditLog.application_id == app_rec.id).order_by(AuditLog.timestamp.asc()).all()
        history_dtos = [AuditLogItemDTO.model_validate(log) for log in logs]

        officer_name = None
        if app_rec.assigned_officer_id:
            officer = db.query(User).filter(User.id == app_rec.assigned_officer_id).first()
            if officer:
                officer_name = officer.full_name

        return ServiceApplicationResponseDTO(
            id=app_rec.id,
            application_number=app_rec.application_number,
            user_id=app_rec.user_id,
            service_type=app_rec.service_type,
            sub_service_name=app_rec.sub_service_name,
            status=app_rec.status.value,
            applicant_name=app_rec.applicant_name,
            applicant_phone=app_rec.applicant_phone,
            remarks=app_rec.remarks,
            assigned_officer_id=app_rec.assigned_officer_id,
            assigned_officer_name=officer_name,
            created_at=app_rec.created_at,
            updated_at=app_rec.updated_at,
            history=history_dtos
        )

citizen_service = CitizenService()
