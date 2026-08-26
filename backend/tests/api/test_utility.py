import pytest

def test_get_bill_types(client):
    response = client.get("/api/utility/bill-types")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4
    assert any(b["id"] == "electricity" for b in data)

def test_pay_utility_bill_and_history_flow(client):
    reg_payload = {
        "full_name": "আব্দুল বাসিত",
        "phone_number": "+8801733445566",
        "password": "password123",
        "role": "citizen"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    pay_payload = {
        "bill_type": "electricity",
        "account_number": "109847563",
        "amount_bdt": 1450.0
    }
    pay_res = client.post("/api/utility/pay", json=pay_payload, headers=headers)
    assert pay_res.status_code == 201
    pay_data = pay_res.json()
    assert pay_data["transaction_id"].startswith("TXN-2026-")
    assert pay_data["amount_bdt"] == 1450.0
    assert pay_data["status"] == "Paid"

    my_bills_res = client.get("/api/utility/my-bills", headers=headers)
    assert my_bills_res.status_code == 200
    my_bills = my_bills_res.json()
    assert len(my_bills) >= 1
    assert my_bills[0]["transaction_id"] == pay_data["transaction_id"]

    bill_id = pay_data["id"]
    receipt_res = client.get(f"/api/utility/bills/{bill_id}", headers=headers)
    assert receipt_res.status_code == 200
    assert receipt_res.json()["account_number"] == "109847563"
