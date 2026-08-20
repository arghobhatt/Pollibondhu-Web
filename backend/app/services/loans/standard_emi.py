from app.services.loans.strategy import LoanCalculationStrategy
from app.models.domain import LoanCalculationResponseDTO, RepaymentScheduleItemDTO

class StandardEMIStrategy(LoanCalculationStrategy):
    def calculate_repayment(
        self, principal: float, annual_rate: float, duration_months: int
    ) -> LoanCalculationResponseDTO:
        r = (annual_rate / 100) / 12
        n = duration_months

        if r > 0:
            emi = (principal * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1)
        else:
            emi = principal / n

        schedule = []
        balance = principal
        total_interest = 0.0

        for period in range(1, n + 1):
            interest_component = balance * r
            principal_component = emi - interest_component
            balance = max(0.0, balance - principal_component)
            total_interest += interest_component

            schedule.append(
                RepaymentScheduleItemDTO(
                    period=period,
                    payment=round(emi, 2),
                    principal_component=round(principal_component, 2),
                    interest_component=round(interest_component, 2),
                    remaining_balance=round(balance, 2)
                )
            )

        total_repayment = principal + total_interest

        return LoanCalculationResponseDTO(
            scheme_type="Standard Monthly EMI",
            principal=round(principal, 2),
            total_repayment=round(total_repayment, 2),
            total_interest=round(total_interest, 2),
            periodic_payment=round(emi, 2),
            schedule=schedule
        )
