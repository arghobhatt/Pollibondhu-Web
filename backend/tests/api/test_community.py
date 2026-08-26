import pytest

def test_get_forum_posts(client):
    response = client.get("/api/community/forum/posts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "title" in data[0]

def test_create_forum_post_and_retrieve(client):
    reg_payload = {
        "full_name": "মোঃ জহিরুল ইসলাম",
        "phone_number": "+8801744556677",
        "password": "password123",
        "role": "citizen"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    post_payload = {
        "title": "নতুন আম গাছে মুকুল ঝরে পড়া রোধের উপায়",
        "category": "কৃষি পরামর্শ",
        "content": "আমার খামারের তরুণ আম গাছে প্রচুর মুকুল এসেছে কিন্তু পোকার কারণে মুকুল ঝরে যাচ্ছে।"
    }
    post_res = client.post("/api/community/forum/posts", json=post_payload, headers=headers)
    assert post_res.status_code == 201
    post_data = post_res.json()
    assert post_data["title"] == "নতুন আম গাছে মুকুল ঝরে পড়া রোধের উপায়"
    assert post_data["author_name"] == "মোঃ জহিরুল ইসলাম"

    posts_res = client.get("/api/community/forum/posts?category=কৃষি পরামর্শ")
    assert posts_res.status_code == 200
    assert any(p["id"] == post_data["id"] for p in posts_res.json())

def test_get_training_courses(client):
    response = client.get("/api/community/training/courses")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "instructor_bn" in data[0]

    course_id = data[0]["id"]
    details_res = client.get(f"/api/community/training/courses/{course_id}")
    assert details_res.status_code == 200
    assert details_res.json()["id"] == course_id
