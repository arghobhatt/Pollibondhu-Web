from typing import Optional
from app.services.loans.strategy import LoanCalculationStrategy
from app.services.loans.standard_emi import StandardEMIStrategy
from app.services.loans.seasonal_crop import SeasonalCropLoanStrategy
from app.services.loans.subsidy_loan import GovernmentSubsidyLoanStrategy
from app.models.domain import LoanCalculationResponseDTO

class LoanCalculatorContext:
    def __init__(self, strategy: Optional[LoanCalculationStrategy] = None):
        self._strategy = strategy or StandardEMIStrategy()

    def set_strategy(self, strategy: LoanCalculationStrategy) -> None:
        self._strategy = strategy

    def set_strategy_by_name(self, scheme_name: str) -> None:
        name = scheme_name.lower().strip()
        if name in ["seasonal", "seasonal_crop", "crop"]:
            self._strategy = SeasonalCropLoanStrategy()
        elif name in ["subsidy", "subsidy_loan", "government_subsidy"]:
            self._strategy = GovernmentSubsidyLoanStrategy()
        else:
            self._strategy = StandardEMIStrategy()

    def calculate(
        self, principal: float, annual_rate: float, duration_months: int
    ) -> LoanCalculationResponseDTO:
        return self._strategy.calculate_repayment(principal, annual_rate, duration_months)
