import pytest

def test_create_complaint_and_fetch_my_complaints_flow(client):
    reg_payload = {
        "full_name": "করিম সাহেব",
        "phone_number": "+8801755443322",
        "password": "password123",
        "role": "citizen"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    cmp_payload = {
        "category": "সার সংকট",
        "description": "ধামরাই ইউনিয়নে বিসিআইসি সার ডিলারের নিকট সার পাওয়া যাচ্ছে না।"
    }
    create_res = client.post("/api/complaints", json=cmp_payload, headers=headers)
    assert create_res.status_code == 201
    cmp_data = create_res.json()
    assert cmp_data["complaint_number"].startswith("CMP-2026-")
    assert cmp_data["category"] == "সার সংকট"

    my_cmps_res = client.get("/api/complaints/my-complaints", headers=headers)
    assert my_cmps_res.status_code == 200
    my_cmps = my_cmps_res.json()
    assert len(my_cmps) >= 1
    assert my_cmps[0]["complaint_number"] == cmp_data["complaint_number"]

def test_officer_complaint_status_update_observer_flow(client):
    officer_reg = {
        "full_name": "মোঃ রফিকুল ইসলাম (অভিযোগ তদন্ত কর্মকর্তা)",
        "phone_number": "+8801888999000",
        "password": "officerpassword123",
        "role": "officer",
        "district": "ঢাকা"
    }
    off_reg_res = client.post("/api/auth/register", json=officer_reg)
    off_token = off_reg_res.json()["access_token"]
    off_headers = {"Authorization": f"Bearer {off_token}"}

    citizen_reg = {
        "full_name": "মোস্তফা রহমান",
        "phone_number": "+8801799887766",
        "password": "password123",
        "role": "citizen"
    }
    cit_reg_res = client.post("/api/auth/register", json=citizen_reg)
    cit_token = cit_reg_res.json()["access_token"]
    cit_headers = {"Authorization": f"Bearer {cit_token}"}

    cmp_payload = {
        "category": "কৃষি সেচ",
        "description": "গভীর নলকূপ বিদ্যুৎ সংযোগ স্থগিত রয়েছে।"
    }
    create_res = client.post("/api/complaints", json=cmp_payload, headers=cit_headers)
    cmp_id = create_res.json()["id"]

    all_cmps_res = client.get("/api/complaints", headers=off_headers)
    assert all_cmps_res.status_code == 200
    assert len(all_cmps_res.json()) >= 1

    update_payload = {
        "new_status": "Under Investigation",
        "resolution_notes": "উপজেলা সেচ কর্মকর্তা স্থান পরিদর্শন করেছেন"
    }
    update_res = client.put(f"/api/complaints/{cmp_id}/status", json=update_payload, headers=off_headers)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["status"] == "Under Investigation"
    assert len(updated_data["history"]) >= 2
