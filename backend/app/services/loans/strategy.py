from abc import ABC, abstractmethod
from app.models.domain import LoanCalculationResponseDTO

class LoanCalculationStrategy(ABC):
    @abstractmethod
    def calculate_repayment(
        self, principal: float, annual_rate: float, duration_months: int
    ) -> LoanCalculationResponseDTO:
        pass
