import pytest

def test_get_service_categories_success(client):
    response = client.get("/api/services/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    assert data[0]["id"] == "agriculture"

def test_get_service_detail_success(client):
    response = client.get("/api/services/agri_loan")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "agri_loan"
    assert "কৃষি ঋণ" in data["name_bn"]

def test_citizen_service_application_and_tracking_flow(client):
    reg_payload = {
        "full_name": "জামাল হোসেন",
        "phone_number": "+8801777666555",
        "password": "password123",
        "role": "citizen"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    app_payload = {
        "service_type": "agri_loan",
        "sub_service_name": "কৃষি ঋণ ও কিস্তি সহায়তা",
        "applicant_name": "জামাল হোসেন",
        "applicant_phone": "+8801777666555",
        "remarks": "আমন ধানের জন্য জরুরি ঋণ প্রয়োজন"
    }
    app_res = client.post("/api/applications", json=app_payload, headers=headers)
    assert app_res.status_code == 201
    app_data = app_res.json()
    assert app_data["applicant_name"] == "জামাল হোসেন"
    assert app_data["application_number"].startswith("APP-2026-")

    my_apps_res = client.get("/api/applications/my-applications", headers=headers)
    assert my_apps_res.status_code == 200
    my_apps = my_apps_res.json()
    assert len(my_apps) >= 1

    track_res = client.get(f"/api/applications/track/{app_data['application_number']}")
    assert track_res.status_code == 200
    assert track_res.json()["application_number"] == app_data["application_number"]

def test_save_and_unsave_service_flow(client):
    login_payload = {
        "phone_number": "+8801777666555",
        "password": "password123"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    save_res = client.post("/api/services/agri_loan/save", headers=headers)
    assert save_res.status_code == 200
    assert save_res.json()["service_id"] == "agri_loan"

    get_saved_res = client.get("/api/services/saved/my-saved", headers=headers)
    assert get_saved_res.status_code == 200
    saved_items = get_saved_res.json()
    assert any(s["service_id"] == "agri_loan" for s in saved_items)

    unsave_res = client.delete("/api/services/agri_loan/save", headers=headers)
    assert unsave_res.status_code == 200

def test_notifications_and_stats_flow(client):
    login_payload = {
        "phone_number": "+8801777666555",
        "password": "password123"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    notif_res = client.get("/api/notifications", headers=headers)
    assert notif_res.status_code == 200
    notifs = notif_res.json()
    if notifs:
        notif_id = notifs[0]["id"]
        read_res = client.put(f"/api/notifications/{notif_id}/read", headers=headers)
        assert read_res.status_code == 200

    stats_res = client.get("/api/citizens/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "total_applications" in stats
    assert "pending_applications" in stats
