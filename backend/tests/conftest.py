import pytest
import asyncio
import random
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, AsyncMock
from app.main import app
from app.db.database import Base, engine

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def mock_httpx_client():
    mock = AsyncMock()
    mock.get = AsyncMock()
    return mock

def get_unique_user_token(client, role="citizen"):
    rnd = random.randint(1000000, 9999999)
    phone = f"+88017{rnd}"
    nid = f"1990{rnd}"
    reg_payload = {
        "full_name": f"Test User {rnd}",
        "phone_number": phone,
        "nid_number": nid,
        "password": "password123",
        "role": role
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    if reg_res.status_code == 201:
        return reg_res.json()["access_token"], phone
    login_res = client.post("/api/auth/login", json={"phone_number": phone, "password": "password123"})
    if login_res.status_code == 200:
        return login_res.json()["access_token"], phone
    raise RuntimeError(f"Failed to get token: {reg_res.text}")
