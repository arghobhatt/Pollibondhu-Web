import pytest
from tests.conftest import get_unique_user_token

def test_get_market_prices(client):
    response = client.get("/api/agriculture/market-prices")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "price_bdt_per_mon" in data[0]

def test_add_market_price_officer_success(client):
    token, _ = get_unique_user_token(client, role="officer")
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "crop_name": "Mustard",
        "crop_name_bn": "সরিষা",
        "market_name": "ধামরাই হাট",
        "district": "ঢাকা",
        "price_bdt_per_mon": 3200.0
    }
    response = client.post("/api/agriculture/market-prices", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["crop_name"] == "Mustard"
    assert data["price_bdt_per_mon"] == 3200.0

def test_add_market_price_citizen_forbidden_failure(client):
    token, _ = get_unique_user_token(client, role="citizen")
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "crop_name": "Mustard",
        "crop_name_bn": "সরিষা",
        "market_name": "ধামরাই হাট",
        "district": "ঢাকা",
        "price_bdt_per_mon": 3200.0
    }
    response = client.post("/api/agriculture/market-prices", json=payload, headers=headers)
    assert response.status_code == 403

def test_get_crop_doctor_diseases(client):
    response = client.get("/api/agriculture/crop-doctor")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "symptoms_bn" in data[0]

def test_get_crop_doctor_disease_detail(client):
    diseases = client.get("/api/agriculture/crop-doctor").json()
    disease_id = diseases[0]["id"]
    
    response = client.get(f"/api/agriculture/crop-doctor/{disease_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == disease_id
    assert "treatment_bn" in data

def test_get_agri_articles(client):
    response = client.get("/api/agriculture/articles")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "summary_bn" in data[0]

def test_apply_agri_loan_strategy_flow(client):
    token, phone = get_unique_user_token(client, role="citizen")
    headers = {"Authorization": f"Bearer {token}"}

    loan_payload = {
        "principal_amount": 150000.0,
        "annual_interest_rate": 8.0,
        "duration_months": 12,
        "scheme_type": "seasonal_crop",
        "applicant_name": "আব্দুল আলীম",
        "applicant_phone": phone
    }
    response = client.post("/api/agriculture/loans/apply", json=loan_payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["application_number"].startswith("LOAN-2026-") or data["application_number"].startswith("APP-2026-")
    assert data["principal_amount"] == 150000.0
    assert data["total_repayment"] > 150000.0
