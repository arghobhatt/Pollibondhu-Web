import pytest

def test_get_emergency_categories(client):
    response = client.get("/api/emergency/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5
    assert any(c["id"] == "national" for c in data)

def test_get_emergency_contacts(client):
    response = client.get("/api/emergency/contacts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4
    assert any(c["phone_number"] == "999" for c in data)

def test_filter_emergency_contacts_by_category(client):
    response = client.get("/api/emergency/contacts?category=agriculture")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["phone_number"] == "16123"
