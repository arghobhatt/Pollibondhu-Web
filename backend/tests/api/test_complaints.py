import pytest
from tests.conftest import get_unique_user_token

def test_create_complaint_and_fetch_my_complaints_flow(client):
    token, _ = get_unique_user_token(client, role="citizen")
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
    assert any(c["complaint_number"] == cmp_data["complaint_number"] for c in my_cmps)

def test_officer_complaint_status_update_observer_flow(client):
    off_token, _ = get_unique_user_token(client, role="officer")
    off_headers = {"Authorization": f"Bearer {off_token}"}

    cit_token, _ = get_unique_user_token(client, role="citizen")
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
