import pytest

def test_get_transport_routes(client):
    response = client.get("/api/transport/routes")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "schedules" in data[0]
    assert len(data[0]["schedules"]) >= 1

def test_filter_transport_routes(client):
    response = client.get("/api/transport/routes?origin=ধামরাই")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["origin_bn"] == "ধামরাই"

def test_get_transport_route_details(client):
    routes = client.get("/api/transport/routes").json()
    route_id = routes[0]["id"]

    response = client.get(f"/api/transport/routes/{route_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == route_id
    assert "schedules" in data

def test_get_transport_locations(client):
    response = client.get("/api/transport/locations")
    assert response.status_code == 200
    data = response.json()
    assert "origins" in data
    assert "destinations" in data
