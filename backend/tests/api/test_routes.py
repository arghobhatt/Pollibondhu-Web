import pytest
from unittest.mock import patch, AsyncMock
from app.models.domain import WeatherDataDTO

def test_get_weather_success(client):
    mock_weather_dto = WeatherDataDTO(
        city="ঢাকা",
        temperature_celsius=28.5,
        humidity=72,
        condition_bn="রোদ উজ্জ্বল",
        wind_speed=10.0,
        cached=False
    )

    with patch("app.api.weather.weather_facade.get_weather_forecast", new_callable=AsyncMock) as mock_get_weather:
        mock_get_weather.return_value = mock_weather_dto

        response = client.get("/api/weather?city=ঢাকা")
        assert response.status_code == 200
        data = response.json()
        assert data["city"] == "ঢাকা"
        assert data["temperature_celsius"] == 28.5
        assert data["condition_bn"] == "রোদ উজ্জ্বল"
        mock_get_weather.assert_called_once_with("ঢাকা")

def test_get_weather_default_city_query_param(client):
    mock_weather_dto = WeatherDataDTO(
        city="ঢাকা",
        temperature_celsius=29.0,
        humidity=70,
        condition_bn="পরিষ্কার আকাশ",
        wind_speed=8.0,
        cached=True
    )

    with patch("app.api.weather.weather_facade.get_weather_forecast", new_callable=AsyncMock) as mock_get_weather:
        mock_get_weather.return_value = mock_weather_dto

        response = client.get("/api/weather")
        assert response.status_code == 200
        data = response.json()
        assert data["city"] == "ঢাকা"
        mock_get_weather.assert_called_once_with("ঢাকা")

def test_send_notification_success(client):
    payload = {
        "recipient": "+8801812345678",
        "message": "আবেদন অনুমোদিত হয়েছে",
        "channel": "sms"
    }
    response = client.post("/api/notifications/send", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["channel"] == "sms"
    assert data["recipient"] == "+8801812345678"
    assert data["message_id"].startswith("SMS-")

def test_send_notification_invalid_input_validation_failure(client):
    invalid_payload = {
        "recipient": "+8801812345678"
    }
    response = client.post("/api/notifications/send", json=invalid_payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data

def test_calculate_loan_success_standard_emi(client):
    payload = {
        "principal": 100000.0,
        "annual_rate": 12.0,
        "duration_months": 12,
        "scheme_type": "standard_emi"
    }
    response = client.post("/api/loans/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["scheme_type"] == "Standard Monthly EMI"
    assert data["principal"] == 100000.0
    assert len(data["schedule"]) == 12
    assert data["total_repayment"] > 100000.0

def test_calculate_loan_success_seasonal_crop(client):
    payload = {
        "principal": 120000.0,
        "annual_rate": 12.0,
        "duration_months": 12,
        "scheme_type": "seasonal_crop"
    }
    response = client.post("/api/loans/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Seasonal" in data["scheme_type"]
    assert data["schedule"][0]["principal_component"] == 0.0

def test_calculate_loan_invalid_input_validation_failure(client):
    invalid_payload = {
        "principal": -50000.0,
        "annual_rate": 10.0,
        "duration_months": 0,
        "scheme_type": "standard_emi"
    }
    response = client.post("/api/loans/calculate", json=invalid_payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data

def test_update_application_status_success(client):
    payload = {
        "application_id": "APP-2026-8801",
        "new_status": "Approved",
        "remarks": "Documents verified by Upojila Krishi Officer"
    }
    response = client.put("/api/applications/status", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["application_id"] == "APP-2026-8801"
    assert data["new_status"] == "Approved"

def test_update_application_status_invalid_input_validation_failure(client):
    invalid_payload = {
        "new_status": "Approved",
        "remarks": "Missing ID"
    }
    response = client.put("/api/applications/status", json=invalid_payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data

def test_read_root_success(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "design_patterns" in data
