from fastapi import APIRouter
from app.services.loans.calculator import LoanCalculatorContext
from app.models.domain import LoanCalculationRequestDTO, LoanCalculationResponseDTO

router = APIRouter(prefix="/api/loans", tags=["Agricultural Loans"])

@router.post("/calculate", response_model=LoanCalculationResponseDTO)
async def calculate_loan(req: LoanCalculationRequestDTO):
    context = LoanCalculatorContext()
    context.set_strategy_by_name(req.scheme_type)
    return context.calculate(
        principal=req.principal,
        annual_rate=req.annual_rate,
        duration_months=req.duration_months
    )
