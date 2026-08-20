import pytest
from app.services.loans.strategy import LoanCalculationStrategy
from app.services.loans.standard_emi import StandardEMIStrategy
from app.services.loans.seasonal_crop import SeasonalCropLoanStrategy
from app.services.loans.subsidy_loan import GovernmentSubsidyLoanStrategy
from app.services.loans.calculator import LoanCalculatorContext

def test_standard_emi_normal_calculation():
    strategy = StandardEMIStrategy()
    result = strategy.calculate_repayment(principal=100000.0, annual_rate=12.0, duration_months=12)

    assert result.principal == 100000.0
    assert len(result.schedule) == 12
    assert abs(result.periodic_payment - 8884.88) < 1.0
    assert abs(result.total_repayment - 106618.55) < 1.0
    assert abs(result.total_interest - 6618.55) < 1.0
    assert result.schedule[-1].remaining_balance == 0.0

def test_standard_emi_zero_interest_rate_boundary():
    strategy = StandardEMIStrategy()
    result = strategy.calculate_repayment(principal=60000.0, annual_rate=0.0, duration_months=6)

    assert result.periodic_payment == 10000.0
    assert result.total_interest == 0.0
    assert result.total_repayment == 60000.0
    assert result.schedule[-1].remaining_balance == 0.0

def test_standard_emi_large_principal_and_long_duration():
    strategy = StandardEMIStrategy()
    result = strategy.calculate_repayment(principal=500000.0, annual_rate=9.0, duration_months=36)

    assert len(result.schedule) == 36
    assert abs(result.periodic_payment - 15899.87) < 1.0
    assert result.schedule[-1].remaining_balance == 0.0

def test_seasonal_crop_normal_calculation_and_grace_period():
    strategy = SeasonalCropLoanStrategy()
    result = strategy.calculate_repayment(principal=120000.0, annual_rate=12.0, duration_months=12)

    first_month = result.schedule[0]
    assert first_month.principal_component == 0.0
    assert first_month.interest_component == 1200.0
    assert first_month.remaining_balance == 120000.0

    fifth_month = result.schedule[4]
    assert fifth_month.principal_component == 15000.0
    assert fifth_month.remaining_balance == 105000.0

    assert result.schedule[-1].remaining_balance == 0.0

def test_seasonal_crop_short_duration_boundary():
    strategy = SeasonalCropLoanStrategy()
    result = strategy.calculate_repayment(principal=30000.0, annual_rate=12.0, duration_months=3)

    assert len(result.schedule) == 3
    assert result.schedule[0].principal_component == 0.0
    assert result.schedule[1].principal_component == 15000.0
    assert result.schedule[-1].remaining_balance == 0.0

def test_subsidy_loan_4percent_rate_capping():
    strategy = GovernmentSubsidyLoanStrategy()
    result = strategy.calculate_repayment(principal=100000.0, annual_rate=10.0, duration_months=12)

    assert abs(result.periodic_payment - 8514.99) < 1.0
    assert abs(result.total_interest - 2179.91) < 1.0
    assert result.schedule[-1].remaining_balance == 0.0

def test_subsidy_loan_low_rate_rebate():
    strategy = GovernmentSubsidyLoanStrategy()
    result = strategy.calculate_repayment(principal=50000.0, annual_rate=6.0, duration_months=6)

    assert result.total_interest < 500.0
    assert result.schedule[-1].remaining_balance == 0.0

def test_calculator_context_dynamic_switching():
    context = LoanCalculatorContext()

    res_default = context.calculate(100000.0, 8.0, 12)
    assert res_default.scheme_type == "Standard Monthly EMI"

    context.set_strategy_by_name("seasonal_crop")
    res_seasonal = context.calculate(100000.0, 8.0, 12)
    assert "Seasonal" in res_seasonal.scheme_type
    assert res_seasonal.schedule[0].principal_component == 0.0

    context.set_strategy_by_name("subsidy_loan")
    res_subsidy = context.calculate(100000.0, 8.0, 12)
    assert "Subsidized" in res_subsidy.scheme_type
    assert res_subsidy.total_interest < res_default.total_interest

    custom_strat = StandardEMIStrategy()
    context.set_strategy(custom_strat)
    assert context._strategy is custom_strat

    context.set_strategy_by_name("unknown_scheme_name")
    assert isinstance(context._strategy, StandardEMIStrategy)
