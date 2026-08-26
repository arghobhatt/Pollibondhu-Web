import pytest

def test_full_integration_audit_all_user_flows(client):
    citizen_phone = "+8801711223344"
    reg_citizen_payload = {
        "full_name": "আব্দুর রহিম (কৃষক)",
        "phone_number": citizen_phone,
        "password": "password123",
        "role": "citizen",
        "district": "ঢাকা"
    }
    reg_res = client.post("/api/auth/register", json=reg_citizen_payload)
    assert reg_res.status_code in [201, 400]

    login_res = client.post("/api/auth/login", json={"phone_number": citizen_phone, "password": "password123"})
    assert login_res.status_code == 200
    citizen_token = login_res.json()["access_token"]
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}

    stats_res = client.get("/api/citizens/stats", headers=citizen_headers)
    assert stats_res.status_code == 200
    stats_data = stats_res.json()
    assert "total_applications" in stats_data

    cats_res = client.get("/api/services/categories")
    assert cats_res.status_code == 200
    categories = cats_res.json()
    assert len(categories) >= 1

    sub_res = client.get("/api/services/agri_loan")
    assert sub_res.status_code == 200

    apply_payload = {
        "service_type": "agri_loan",
        "sub_service_name": "সার ও বীজ ভর্তুকি কুপন",
        "applicant_name": "আব্দুর রহিম",
        "applicant_phone": citizen_phone,
        "remarks": "আমন ধান চাষের জন্য সার অনুদান আবেদন"
    }
    app_res = client.post("/api/applications", json=apply_payload, headers=citizen_headers)
    assert app_res.status_code == 201
    app_data = app_res.json()
    app_number = app_data["application_number"]

    track_res = client.get(f"/api/applications/track/{app_number}")
    assert track_res.status_code == 200
    tracked_data = track_res.json()
    assert tracked_data["application_number"] == app_number

    notifs_res = client.get("/api/notifications", headers=citizen_headers)
    assert notifs_res.status_code == 200

    complaint_payload = {
        "category": "সার সংকট",
        "description": "উপজেলা বাজারে ইউরিয়া সার ডিলারের কৃত্রিম সংকট অভিযোগ।"
    }
    comp_res = client.post("/api/complaints", json=complaint_payload, headers=citizen_headers)
    assert comp_res.status_code == 201
    comp_data = comp_res.json()
    comp_number = comp_data["complaint_number"]

    my_comps_res = client.get("/api/complaints/my-complaints", headers=citizen_headers)
    assert my_comps_res.status_code == 200
    my_comps = my_comps_res.json()
    assert any(c["complaint_number"] == comp_number for c in my_comps)

    market_res = client.get("/api/agriculture/market-prices")
    assert market_res.status_code == 200

    doctor_res = client.get("/api/agriculture/crop-doctor?crop_name=Rice")
    assert doctor_res.status_code == 200

    weather_res = client.get("/api/weather?city=ঢাকা")
    assert weather_res.status_code == 200
    weather_data = weather_res.json()
    assert "temperature_celsius" in weather_data

    calc_payload = {
        "principal": 50000,
        "annual_rate": 8.0,
        "duration_months": 12,
        "scheme_type": "standard_emi"
    }
    calc_res = client.post("/api/loans/calculate", json=calc_payload)
    assert calc_res.status_code == 200
    calc_data = calc_res.json()
    assert calc_data["total_repayment"] > 50000

    loan_apply_payload = {
        "principal_amount": 50000,
        "annual_interest_rate": 8.0,
        "duration_months": 12,
        "scheme_type": "standard_emi",
        "applicant_name": "আব্দুর রহিম",
        "applicant_phone": citizen_phone
    }
    loan_res = client.post("/api/agriculture/loans/apply", json=loan_apply_payload, headers=citizen_headers)
    assert loan_res.status_code == 201

    officer_phone = "+8801811223344"
    reg_officer_payload = {
        "full_name": "মোঃ মাহমুদুল হাসান (কর্মকর্তা)",
        "phone_number": officer_phone,
        "password": "password123",
        "role": "officer",
        "district": "ঢাকা"
    }
    client.post("/api/auth/register", json=reg_officer_payload)

    officer_login_res = client.post("/api/auth/login", json={"phone_number": officer_phone, "password": "password123"})
    assert officer_login_res.status_code == 200
    officer_token = officer_login_res.json()["access_token"]
    officer_headers = {"Authorization": f"Bearer {officer_token}"}

    off_stats_res = client.get("/api/officer/stats", headers=officer_headers)
    assert off_stats_res.status_code == 200

    off_apps_res = client.get("/api/officer/applications", headers=officer_headers)
    assert off_apps_res.status_code == 200
    off_apps = off_apps_res.json()
    assert len(off_apps) >= 1

    target_app = off_apps[0]
    update_app_res = client.put(
        f"/api/officer/applications/{target_app['id']}/status",
        json={"status": "Approved", "remarks": "যাচাইপূর্বক অনুমোদন প্রদান করা হলো।"},
        headers=officer_headers
    )
    assert update_app_res.status_code == 200

    off_comps_res = client.get("/api/officer/complaints", headers=officer_headers)
    assert off_comps_res.status_code == 200
    off_comps = off_comps_res.json()
    assert len(off_comps) >= 1

    target_comp = off_comps[0]
    update_comp_res = client.put(
        f"/api/officer/complaints/{target_comp['id']}/status",
        json={"status": "Resolved", "remarks": "উপজেলা কৃষি টিম সরেজমিনে ডিলার পরিদর্শনের মাধ্যমে সার সরবরাহ নিশ্চিত করেছে।"},
        headers=officer_headers
    )
    assert update_comp_res.status_code == 200

    bill_types_res = client.get("/api/utility/bill-types")
    assert bill_types_res.status_code == 200

    pay_payload = {
        "bill_type": "electricity",
        "account_number": "ELEC-100200300",
        "amount_bdt": 1250.0
    }
    pay_res = client.post("/api/utility/pay", json=pay_payload, headers=citizen_headers)
    assert pay_res.status_code == 201
    pay_data = pay_res.json()
    assert pay_data["transaction_id"].startswith("TXN-2026-")

    my_bills_res = client.get("/api/utility/my-bills", headers=citizen_headers)
    assert my_bills_res.status_code == 200
    my_bills = my_bills_res.json()
    assert len(my_bills) >= 1

    locs_res = client.get("/api/transport/locations")
    assert locs_res.status_code == 200

    routes_res = client.get("/api/transport/routes?origin=ধামরাই")
    assert routes_res.status_code == 200
    routes_data = routes_res.json()
    assert len(routes_data) >= 1
    assert "schedules" in routes_data[0]

    em_cats_res = client.get("/api/emergency/categories")
    assert em_cats_res.status_code == 200

    em_contacts_res = client.get("/api/emergency/contacts")
    assert em_contacts_res.status_code == 200
    em_contacts = em_contacts_res.json()
    assert len(em_contacts) >= 1
