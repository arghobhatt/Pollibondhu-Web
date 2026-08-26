from typing import Optional, Union
from app.services.loans.strategy import LoanCalculationStrategy
from app.services.loans.standard_emi import StandardEMIStrategy
from app.services.loans.seasonal_crop import SeasonalCropLoanStrategy
from app.services.loans.subsidy_loan import GovernmentSubsidyLoanStrategy
from app.models.domain import LoanCalculationResponseDTO

class LoanCalculatorContext:
    def __init__(self, strategy_or_name: Optional[Union[LoanCalculationStrategy, str]] = None):
        if isinstance(strategy_or_name, str):
            self.set_strategy_by_name(strategy_or_name)
        elif strategy_or_name is not None:
            self._strategy = strategy_or_name
        else:
            self._strategy = StandardEMIStrategy()

    def set_strategy(self, strategy: LoanCalculationStrategy) -> None:
        self._strategy = strategy

    def set_strategy_by_name(self, scheme_name: str) -> None:
        name = str(scheme_name).lower().strip()
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
