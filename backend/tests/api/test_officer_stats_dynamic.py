import pytest
from app.db.database import SessionLocal
from app.models.orm import User, CitizenComplaint, ComplaintStatus, ApplicationStatus, ServiceApplication

def get_test_token(client, phone, role="officer"):
    nid = f"1990{phone[-7:]}"
    reg_payload = {
        "full_name": "টেস্ট কর্মকর্তা",
        "phone_number": phone,
        "nid_number": nid,
        "password": "password123",
        "role": role
    }
    client.post("/api/auth/register", json=reg_payload)
    login_res = client.post("/api/auth/login", json={"phone_number": phone, "password": "password123"})
    if login_res.status_code == 200:
        return login_res.json()["access_token"]
    raise RuntimeError(f"Authentication failed: {login_res.text}")

def test_officer_dashboard_stats_dynamic_calculations(client):
    token = get_test_token(client, "+8801899993377", "officer")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Baseline stats
    res = client.get("/api/officer/stats", headers=headers)
    assert res.status_code == 200
    baseline = res.json()
    assert baseline["assigned_applications_count"] >= 0
    assert baseline["assigned_complaints_count"] >= 0
    assert baseline["approved_applications_count"] >= 0
    assert baseline["resolved_complaints_count"] >= 0

    # 2. Add dynamic resolved complaint
    db = SessionLocal()
    user = db.query(User).first()
    test_cmp = CitizenComplaint(
        complaint_number="CMP-PYTEST-DYN-01",
        user_id=user.id,
        category="কৃষি সার সংকট",
        description="ডায়নামিক টেস্ট অভিযোগ",
        status=ComplaintStatus.RESOLVED,
        resolution_notes="মীমাংসিত"
    )
    db.add(test_cmp)
    db.commit()

    # 3. Check increment
    res_after = client.get("/api/officer/stats", headers=headers)
    assert res_after.status_code == 200
    updated = res_after.json()
    assert updated["assigned_complaints_count"] == baseline["assigned_complaints_count"] + 1
    assert updated["resolved_complaints_count"] == baseline["resolved_complaints_count"] + 1

    # 4. Clean up
    db.delete(test_cmp)
    db.commit()

    # 5. Check decrement back
    res_cleanup = client.get("/api/officer/stats", headers=headers)
    assert res_cleanup.status_code == 200
    cleaned = res_cleanup.json()
    assert cleaned["assigned_complaints_count"] == baseline["assigned_complaints_count"]
    assert cleaned["resolved_complaints_count"] == baseline["resolved_complaints_count"]
    db.close()
