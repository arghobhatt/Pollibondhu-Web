import random
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.orm import (
    User,
    CropMarketPrice,
    CropDisease,
    AgriArticle,
    ServiceApplication,
    ApplicationStatus,
    LoanApplication,
    AuditLog
)
from app.schemas.agriculture import (
    MarketPriceDTO,
    MarketPriceCreateDTO,
    CropDiseaseDTO,
    AgriArticleDTO,
    AgriLoanApplicationCreateDTO,
    AgriLoanApplicationResponseDTO
)
from app.services.loans.calculator import LoanCalculatorContext
from app.services.events.publisher import application_event_publisher

class AgricultureService:
    def get_market_prices(self, db: Session, district: Optional[str] = None, division: Optional[str] = None) -> List[MarketPriceDTO]:
        query = db.query(CropMarketPrice)
        if division and division.strip():
            query = query.filter(CropMarketPrice.division.ilike(f"%{division.strip()}%"))
        if district and district.strip():
            query = query.filter(CropMarketPrice.district.ilike(f"%{district.strip()}%"))
        prices = query.order_by(CropMarketPrice.updated_at.desc()).all()
        return [MarketPriceDTO.model_validate(p) for p in prices]

    def add_or_update_market_price(self, db: Session, officer: User, req: MarketPriceCreateDTO) -> MarketPriceDTO:
        existing = db.query(CropMarketPrice).filter(
            CropMarketPrice.crop_name == req.crop_name,
            CropMarketPrice.district == req.district,
            CropMarketPrice.market_name == req.market_name
        ).first()

        if existing:
            existing.price_bdt_per_mon = req.price_bdt_per_mon
            if req.division:
                existing.division = req.division
            existing.reported_by_id = officer.id
            db.commit()
            db.refresh(existing)
            return MarketPriceDTO.model_validate(existing)
        
        new_price = CropMarketPrice(
            crop_name=req.crop_name,
            crop_name_bn=req.crop_name_bn,
            market_name=req.market_name,
            district=req.district,
            division=req.division or "ঢাকা",
            price_bdt_per_mon=req.price_bdt_per_mon,
            reported_by_id=officer.id
        )
        db.add(new_price)
        db.commit()
        db.refresh(new_price)
        return MarketPriceDTO.model_validate(new_price)

    def get_crop_diseases(self, db: Session, crop_name: Optional[str] = None) -> List[CropDiseaseDTO]:
        query = db.query(CropDisease)
        if crop_name and crop_name.strip():
            query = query.filter(
                (CropDisease.crop_name_bn.ilike(f"%{crop_name.strip()}%")) |
                (CropDisease.crop_name_en.ilike(f"%{crop_name.strip()}%")) |
                (CropDisease.disease_name_bn.ilike(f"%{crop_name.strip()}%"))
            )
        diseases = query.all()
        return [CropDiseaseDTO.model_validate(d) for d in diseases]

    def get_disease_by_id(self, db: Session, disease_id: int) -> CropDiseaseDTO:
        disease = db.query(CropDisease).filter(CropDisease.id == disease_id).first()
        if not disease:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop disease details not found")
        return CropDiseaseDTO.model_validate(disease)

    def get_articles(self, db: Session, category: Optional[str] = None) -> List[AgriArticleDTO]:
        query = db.query(AgriArticle)
        if category and category.strip():
            query = query.filter(AgriArticle.category == category.strip())
        articles = query.order_by(AgriArticle.created_at.desc()).all()
        return [AgriArticleDTO.model_validate(a) for a in articles]

    async def apply_for_agri_loan(self, db: Session, user: User, req: AgriLoanApplicationCreateDTO) -> AgriLoanApplicationResponseDTO:
        calc_context = LoanCalculatorContext(req.scheme_type)
        calc_result = calc_context.calculate(
            principal=req.principal_amount,
            annual_rate=req.annual_interest_rate,
            duration_months=req.duration_months
        )

        app_num = f"LOAN-2026-{random.randint(1000, 9999)}"
        officer = db.query(User).filter(User.role == UserRole.OFFICER).first()
        officer_id = officer.id if officer else None

        service_app = ServiceApplication(
            application_number=app_num,
            user_id=user.id,
            service_type="agri_loan",
            sub_service_name=f"কৃষি ঋণ ({req.scheme_type})",
            status=ApplicationStatus.PENDING,
            applicant_name=req.applicant_name or user.full_name,
            applicant_phone=req.applicant_phone or user.phone_number,
            remarks=f"ঋণের পরিমাণ: {req.principal_amount} BDT, মেয়াাদ: {req.duration_months} মাস",
            assigned_officer_id=officer_id
        )
        db.add(service_app)
        db.commit()
        db.refresh(service_app)

        loan_rec = LoanApplication(
            application_id=service_app.id,
            user_id=user.id,
            scheme_type=req.scheme_type,
            principal_amount=req.principal_amount,
            annual_interest_rate=req.annual_interest_rate,
            duration_months=req.duration_months,
            total_repayment=calc_result["total_repayment"],
            total_interest=calc_result["total_interest"],
            status="Pending"
        )
        db.add(loan_rec)

        initial_audit = AuditLog(
            application_id=service_app.id,
            action="Submitted",
            old_status=None,
            new_status=ApplicationStatus.PENDING.value,
            performed_by=user.full_name,
            remarks="কৃষি ঋণ ক্যালকুলেটর থেকে সরাসরি আবেদন জমা করা হয়েছে"
        )
        db.add(initial_audit)
        db.commit()

        await application_event_publisher.notify_status_change(
            application_id=app_num,
            applicant_phone=service_app.applicant_phone,
            new_status=ApplicationStatus.PENDING.value,
            sub_service_name=service_app.sub_service_name
        )

        return AgriLoanApplicationResponseDTO(
            id=loan_rec.id,
            application_number=app_num,
            scheme_type=req.scheme_type,
            principal_amount=req.principal_amount,
            total_repayment=calc_result["total_repayment"],
            total_interest=calc_result["total_interest"],
            status=loan_rec.status,
            created_at=loan_rec.created_at
        )

agriculture_service = AgricultureService()
