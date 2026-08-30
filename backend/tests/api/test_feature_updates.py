import pytest
from app.models.orm import UserRole
from tests.conftest import get_unique_user_token

def test_payment_transaction_id_application_flow(client):
    token, phone = get_unique_user_token(client, role="citizen")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Test validation error when selecting bKash without transaction ID on a fee-based service
    invalid_payload = {
        "service_type": "machinery_grant",
        "sub_service_name": "কৃষি যন্ত্রপাতি উন্নয়ন অনুদান",
        "applicant_name": "হুমায়ুন কবির",
        "applicant_phone": phone,
        "payment_method": "bkash",
        "transaction_id": "   "  # whitespace only
    }
    res = client.post("/api/applications", json=invalid_payload, headers=headers)
    assert res.status_code == 400
    assert "ট্রানজেকশন আইডি" in res.json()["detail"]

    # 2. Test successful submission with bKash Transaction ID
    valid_payload = {
        "service_type": "machinery_grant",
        "sub_service_name": "কৃষি যন্ত্রপাতি উন্নয়ন অনুদান",
        "applicant_name": "হুমায়ুন কবির",
        "applicant_phone": phone,
        "remarks": "৫০% অনুদানে পাওয়ার টিলার আবেদন",
        "payment_method": "bKash",
        "transaction_id": "BK8923741X",
        "payment_sender_account": "01711223344"
    }
    create_res = client.post("/api/applications", json=valid_payload, headers=headers)
    assert create_res.status_code == 201
    app_data = create_res.json()
    assert app_data["transaction_id"] == "BK8923741X"
    assert app_data["payment_method"] == "bKash"
    assert app_data["payment_status"] == "Submitted"
    assert app_data["payment_amount"] == 100.0
    app_num = app_data["application_number"]
    app_id = app_data["id"]

    # 3. Verify citizen can fetch their applications and see transaction ID
    my_apps_res = client.get("/api/applications/my-applications", headers=headers)
    assert my_apps_res.status_code == 200
    my_apps = my_apps_res.json()
    matched_app = next((a for a in my_apps if a["id"] == app_id), None)
    assert matched_app is not None
    assert matched_app["transaction_id"] == "BK8923741X"
    assert matched_app["payment_status"] == "Submitted"

    # 4. Verify tracking endpoint returns transaction details
    track_res = client.get(f"/api/applications/track/{app_num}")
    assert track_res.status_code == 200
    assert track_res.json()["transaction_id"] == "BK8923741X"

    # 5. Officer review: Officer reviews application and verifies payment
    officer_token, _ = get_unique_user_token(client, role="officer")
    officer_headers = {"Authorization": f"Bearer {officer_token}"}
    
    officer_apps_res = client.get("/api/officer/applications", headers=officer_headers)
    assert officer_apps_res.status_code == 200
    
    update_res = client.put(
        f"/api/officer/applications/{app_id}/status",
        json={"status": "Approved", "remarks": "কাগজপত্র ও পেমেন্ট যাচাইকৃত", "payment_status": "Verified"},
        headers=officer_headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "Approved"
    assert update_res.json()["payment_status"] == "Verified"

def test_all_8_divisions_transport_filtering(client):
    divisions = ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ"]

    # Check locations endpoint returns all 8 divisions
    loc_res = client.get("/api/transport/locations")
    assert loc_res.status_code == 200
    loc_data = loc_res.json()
    assert "divisions" in loc_data
    for div in divisions:
        assert div in loc_data["divisions"]

    # Verify each division individually has valid routes and schedules
    for div in divisions:
        res = client.get(f"/api/transport/routes?division={div}")
        assert res.status_code == 200
        routes = res.json()
        assert len(routes) > 0, f"Expected routes for division {div}"
        for r in routes:
            assert r["division"] == div
            assert len(r["schedules"]) > 0
            assert r["fare_bdt"] > 0

    # Test vehicle type filtering (bus, train, launch, auto)
    for v_type in ["bus", "train", "launch", "auto"]:
        res = client.get(f"/api/transport/routes?vehicle_type={v_type}")
        assert res.status_code == 200
        routes = res.json()
        assert len(routes) > 0
        for r in routes:
            assert r["vehicle_type"] == v_type

    # Test combined origin & destination search
    res = client.get("/api/transport/routes?division=সিলেট&vehicle_type=train")
    assert res.status_code == 200
    routes = res.json()
    assert len(routes) >= 1
    assert "সিলেট" in routes[0]["origin_bn"]

def test_forum_reactions_and_comments_flow(client):
    user1_token, _ = get_unique_user_token(client, role="citizen")
    user2_token, _ = get_unique_user_token(client, role="citizen")
    officer_token, _ = get_unique_user_token(client, role="officer")

    headers1 = {"Authorization": f"Bearer {user1_token}"}
    headers2 = {"Authorization": f"Bearer {user2_token}"}
    officer_headers = {"Authorization": f"Bearer {officer_token}"}

    # 1. Create a forum post
    post_res = client.post(
        "/api/community/forum/posts",
        json={
            "title": "টমেটোর ডাল শুকিয়ে যাওয়া রোগ দমন পদ্ধতি",
            "category": "সবজি চাষ",
            "content": "টমেটো গাছে গোড়া পচা ও ডাল শুকিয়ে যাওয়ার লক্ষণ দেখা যাচ্ছে। সমাধান কি?"
        },
        headers=headers1
    )
    assert post_res.status_code == 201
    post_id = post_res.json()["id"]

    # 2. User 1 likes the post
    react_res = client.post(f"/api/community/forum/posts/{post_id}/react", headers=headers1)
    assert react_res.status_code == 200
    assert react_res.json()["user_reacted"] is True
    assert react_res.json()["reactions_count"] == 1

    # 3. User 1 checks posts list - verify user_reacted is True
    posts_res = client.get("/api/community/forum/posts", headers=headers1)
    assert posts_res.status_code == 200
    found_post = next((p for p in posts_res.json() if p["id"] == post_id), None)
    assert found_post is not None
    assert found_post["reactions_count"] == 1
    assert found_post["user_reacted"] is True

    # 4. User 2 checks posts list - user_reacted should be False for user 2
    posts_res2 = client.get("/api/community/forum/posts", headers=headers2)
    found_post2 = next((p for p in posts_res2.json() if p["id"] == post_id), None)
    assert found_post2["reactions_count"] == 1
    assert found_post2["user_reacted"] is False

    # 5. User 2 likes the post -> total count becomes 2
    react_res2 = client.post(f"/api/community/forum/posts/{post_id}/react", headers=headers2)
    assert react_res2.status_code == 200
    assert react_res2.json()["user_reacted"] is True
    assert react_res2.json()["reactions_count"] == 2

    # 6. User 1 unlikes the post -> count becomes 1
    unreact_res = client.post(f"/api/community/forum/posts/{post_id}/react", headers=headers1)
    assert unreact_res.status_code == 200
    assert unreact_res.json()["user_reacted"] is False
    assert unreact_res.json()["reactions_count"] == 1

    # 7. Test Comment Validation (empty comment rejected)
    bad_comment = client.post(
        f"/api/community/forum/posts/{post_id}/comments",
        json={"content": "    "},
        headers=headers1
    )
    assert bad_comment.status_code in (400, 422)

    # 8. User 1 adds a valid comment
    comment_res = client.post(
        f"/api/community/forum/posts/{post_id}/comments",
        json={"content": "কপার অক্সিক্লোরাইড স্প্রে করার পরামর্শ দেওয়া হচ্ছে।"},
        headers=headers1
    )
    assert comment_res.status_code == 201
    comment_id = comment_res.json()["id"]
    assert comment_res.json()["is_author"] is True

    # 9. List comments
    comments_list_res = client.get(f"/api/community/forum/posts/{post_id}/comments", headers=headers1)
    assert comments_list_res.status_code == 200
    assert len(comments_list_res.json()) >= 1
    assert comments_list_res.json()[0]["content"] == "কপার অক্সিক্লোরাইড স্প্রে করার পরামর্শ দেওয়া হচ্ছে।"

    # 10. User 2 cannot delete User 1's comment
    del_forbidden = client.delete(f"/api/community/forum/comments/{comment_id}", headers=headers2)
    assert del_forbidden.status_code == 403

    # 11. Officer CAN moderate/delete User 1's comment
    del_officer = client.delete(f"/api/community/forum/comments/{comment_id}", headers=officer_headers)
    assert del_officer.status_code == 200
