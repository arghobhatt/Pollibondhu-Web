import pytest
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, AsyncMock
from app.main import app

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
