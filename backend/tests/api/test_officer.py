import pytest

def get_test_token(client, phone, role="citizen"):
    reg_payload = {
        "full_name": "টেস্ট ব্যবহারকারী",
        "phone_number": phone,
        "password": "password123",
        "role": role
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    login_res = client.post("/api/auth/login", json={"phone_number": phone, "password": "password123"})
    if login_res.status_code == 200:
        return login_res.json()["access_token"]
    raise RuntimeError(f"Authentication failed: {login_res.text}")

def test_officer_access_control_forbidden_for_citizen(client):
    token = get_test_token(client, "+8801799991111", "citizen")
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/officer/stats", headers=headers)
    assert res.status_code == 403

def test_officer_dashboard_flow_and_observer_trigger(client):
    token = get_test_token(client, "+8801899992222", "officer")
    headers = {"Authorization": f"Bearer {token}"}

    stats_res = client.get("/api/officer/stats", headers=headers)
    assert stats_res.status_code == 200
    stats_data = stats_res.json()
    assert "assigned_applications_count" in stats_data
    assert "assigned_complaints_count" in stats_data

    citizen_headers = {"Authorization": f"Bearer {token}"}
    app_payload = {
        "service_type": "agri_loan",
        "sub_service_name": "কৃষি যন্ত্রপাতি অনুদান",
        "applicant_name": "আব্দুল কুদ্দুস",
        "applicant_phone": "+8801812345678",
        "remarks": "পাওয়ার টিলার সেচ পাম্প অনুদান আবেদন"
    }
    client.post("/api/applications", json=app_payload, headers=citizen_headers)

    apps_res = client.get("/api/officer/applications", headers=headers)
    assert apps_res.status_code == 200
    apps = apps_res.json()
    assert len(apps) >= 1

    target_app_id = apps[0]["id"]
    update_payload = {
        "status": "approved",
        "remarks": "আবেদনকারীর দলিলাদি যাচাইপূর্বক অনুমোদন দেওয়া হলো।"
    }
    update_res = client.put(f"/api/officer/applications/{target_app_id}/status", json=update_payload, headers=headers)
    assert update_res.status_code == 200
    updated_app = update_res.json()
    assert updated_app["status"] in ["approved", "Approved"]
    assert updated_app["remarks"] == "আবেদনকারীর দলিলাদি যাচাইপূর্বক অনুমোদন দেওয়া হলো।"
