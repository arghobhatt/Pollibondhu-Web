import random
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.orm import (
    User,
    UserRole,
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

    def create_market_price(self, db: Session, user: User, dto: MarketPriceCreateDTO) -> MarketPriceDTO:
        if user.role != UserRole.OFFICER and user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only officers can update market prices")
        
        price_record = CropMarketPrice(
            crop_name=dto.crop_name,
            crop_name_bn=dto.crop_name_bn,
            market_name=dto.market_name,
            district=dto.district,
            division=dto.division or "ঢাকা",
            price_bdt_per_mon=dto.price_bdt_per_mon,
            reported_by_id=user.id
        )
        db.add(price_record)
        db.commit()
        db.refresh(price_record)
        return MarketPriceDTO.model_validate(price_record)

    add_or_update_market_price = create_market_price

    def get_crop_diseases(self, db: Session, crop_name: Optional[str] = None) -> List[CropDiseaseDTO]:
        query = db.query(CropDisease)
        if crop_name and crop_name.strip():
            q = f"%{crop_name.strip()}%"
            query = query.filter(
                (CropDisease.crop_name_en.ilike(q)) |
                (CropDisease.crop_name_bn.ilike(q)) |
                (CropDisease.disease_name_bn.ilike(q))
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
            remarks=f"ঋণের পরিমাণ: {req.principal_amount} BDT, মেয়াদ: {req.duration_months} মাস",
            assigned_officer_id=officer_id
        )
        db.add(service_app)
        db.commit()
        db.refresh(service_app)

        monthly_emi = round(calc_result.total_repayment / max(1, req.duration_months), 2)
        loan_rec = LoanApplication(
            application_id=service_app.id,
            user_id=user.id,
            scheme_type=req.scheme_type,
            principal_amount=req.principal_amount,
            annual_interest_rate=req.annual_interest_rate,
            duration_months=req.duration_months,
            total_repayment=calc_result.total_repayment,
            total_interest=calc_result.total_interest,
            status="pending"
        )
        db.add(loan_rec)

        audit = AuditLog(
            application_id=service_app.id,
            action="APPLY_AGRI_LOAN",
            new_status="Pending",
            performed_by=user.full_name,
            remarks=f"Applied for loan {app_num} of amount {req.principal_amount}"
        )
        db.add(audit)
        db.commit()

        await application_event_publisher.notify(
            application_number=app_num,
            new_status="Pending",
            user_phone=user.phone_number,
            user_id=user.id
        )

        return AgriLoanApplicationResponseDTO(
            id=service_app.id,
            application_number=app_num,
            user_id=user.id,
            scheme_type=req.scheme_type,
            principal_amount=req.principal_amount,
            annual_interest_rate=req.annual_interest_rate,
            duration_months=req.duration_months,
            calculated_emi=monthly_emi,
            total_interest=calc_result.total_interest,
            total_repayment=calc_result.total_repayment,
            status="pending",
            created_at=service_app.created_at
        )

agriculture_service = AgricultureService()
