import pytest
import random

TEST_PHONE = f"+88019{random.randint(10000000, 99999999)}"
TEST_NID = f"1999{random.randint(10000000, 99999999)}"

def test_register_user_success(client):
    payload = {
        "full_name": "রহিম উদ্দিন",
        "phone_number": TEST_PHONE,
        "email": f"rahim.{TEST_NID}@pollibondhu.gov.bd",
        "nid_number": TEST_NID,
        "password": "securepassword123",
        "division": "ঢাকা",
        "district": "গাজীপুর",
        "upazila": "কালিয়াকৈর",
        "role": "citizen"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["phone_number"] == TEST_PHONE
    assert data["user"]["full_name"] == "রহিম উদ্দিন"

def test_register_duplicate_phone_failure(client):
    payload = {
        "full_name": "রহিম উদ্দিন",
        "phone_number": TEST_PHONE,
        "nid_number": f"1999{random.randint(10000000, 99999999)}",
        "password": "securepassword123"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400

def test_login_user_success(client):
    payload = {
        "phone_number": TEST_PHONE,
        "password": "securepassword123"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["phone_number"] == TEST_PHONE

def test_login_invalid_password_failure(client):
    payload = {
        "phone_number": TEST_PHONE,
        "password": "wrongpassword"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401

def test_get_current_user_me_success(client):
    login_payload = {
        "phone_number": TEST_PHONE,
        "password": "securepassword123"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    token = login_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    user_data = me_res.json()
    assert user_data["phone_number"] == TEST_PHONE
    assert user_data["full_name"] == "রহিম উদ্দিন"

def test_get_current_user_unauthorized_failure(client):
    me_res = client.get("/api/auth/me")
    assert me_res.status_code == 401

def test_logout_user_success(client):
    login_payload = {
        "phone_number": TEST_PHONE,
        "password": "securepassword123"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    token = login_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    logout_res = client.post("/api/auth/logout", headers=headers)
    assert logout_res.status_code == 200
    assert logout_res.json()["status"] == "success"

def test_forgot_password_success(client):
    payload = {
        "phone_number": TEST_PHONE
    }
    response = client.post("/api/auth/forgot-password", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_reset_password_success(client):
    payload = {
        "phone_number": TEST_PHONE,
        "nid_number": TEST_NID,
        "new_password": "newpassword456"
    }
    response = client.post("/api/auth/reset-password", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    login_payload = {
        "phone_number": TEST_PHONE,
        "password": "newpassword456"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
