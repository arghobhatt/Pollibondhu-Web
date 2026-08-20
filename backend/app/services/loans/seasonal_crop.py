from app.services.loans.strategy import LoanCalculationStrategy
from app.models.domain import LoanCalculationResponseDTO, RepaymentScheduleItemDTO

class SeasonalCropLoanStrategy(LoanCalculationStrategy):
    def calculate_repayment(
        self, principal: float, annual_rate: float, duration_months: int
    ) -> LoanCalculationResponseDTO:
        monthly_rate = (annual_rate / 100) / 12
        grace_months = min(4, max(1, duration_months // 3))
        post_harvest_months = duration_months - grace_months

        schedule = []
        balance = principal
        total_interest = 0.0
        principal_installment = principal / max(1, post_harvest_months)

        for period in range(1, duration_months + 1):
            interest_component = balance * monthly_rate
            total_interest += interest_component

            if period <= grace_months:
                principal_component = 0.0
                payment = interest_component
            else:
                principal_component = principal_installment
                payment = principal_component + interest_component
                balance = max(0.0, balance - principal_component)

            schedule.append(
                RepaymentScheduleItemDTO(
                    period=period,
                    payment=round(payment, 2),
                    principal_component=round(principal_component, 2),
                    interest_component=round(interest_component, 2),
                    remaining_balance=round(balance, 2)
                )
            )

        total_repayment = principal + total_interest

        return LoanCalculationResponseDTO(
            scheme_type=f"Seasonal Crop Loan ({grace_months}-Month Grace Period)",
            principal=round(principal, 2),
            total_repayment=round(total_repayment, 2),
            total_interest=round(total_interest, 2),
            periodic_payment=round(schedule[0].payment, 2),
            schedule=schedule
        )
