def _register(client, login="auth_user"):
    response = client.post("/auth/register", json={
        "first_name": "Тест", "last_name": "Пользователь",
        "email": f"{login}@example.com", "login": login,
        "password": "StrongPass123", "direction_ids": [],
    })
    assert response.status_code == 201, response.text
    return response.json()


def test_auth_register_login_me_refresh_logout(client):
    pair = _register(client)
    assert "hashed_password" not in pair["user"]
    headers = {"Authorization": f"Bearer {pair['access_token']}"}
    assert client.get("/auth/me", headers=headers).status_code == 200
    assert client.get("/projects").status_code == 401

    login = client.post("/auth/login", json={"login": "auth_user", "password": "StrongPass123"})
    assert login.status_code == 200
    assert client.post("/auth/login", json={"login": "auth_user", "password": "wrong"}).status_code == 401

    rotated = client.post("/auth/refresh", json={"refresh_token": pair["refresh_token"]})
    assert rotated.status_code == 200
    assert client.post("/auth/refresh", json={"refresh_token": pair["refresh_token"]}).status_code == 401

    new_pair = rotated.json()
    new_headers = {"Authorization": f"Bearer {new_pair['access_token']}"}
    logout = client.post("/auth/logout", headers=new_headers, json={"refresh_token": new_pair["refresh_token"]})
    assert logout.status_code == 204
    assert client.post("/auth/refresh", json={"refresh_token": new_pair["refresh_token"]}).status_code == 401


def test_project_owner_is_taken_from_token_and_checked(client):
    first = _register(client, "owner_one")
    second = _register(client, "owner_two")
    first_headers = {"Authorization": f"Bearer {first['access_token']}"}
    second_headers = {"Authorization": f"Bearer {second['access_token']}"}

    created = client.post("/projects", headers=first_headers, json={"title": "Личный проект", "owner_id": second["user"]["id"]})
    assert created.status_code == 201
    project_id = created.json()["id"]
    assert created.json()["owner_id"] == first["user"]["id"]
    assert client.get(f"/projects/{project_id}", headers=second_headers).status_code == 404
    assert client.patch(f"/projects/{project_id}", headers=second_headers, json={"title": "Чужой"}).status_code == 404
    assert client.delete(f"/projects/{project_id}", headers=second_headers).status_code == 404


def test_application_owner_is_checked_for_read_update_and_delete(client):
    owner = _register(client, "application_owner")
    other = _register(client, "application_other")
    owner_headers = {"Authorization": f"Bearer {owner['access_token']}"}
    other_headers = {"Authorization": f"Bearer {other['access_token']}"}
    grant = client.post("/grants", headers=owner_headers, json={
        "title": "Конкурс", "organizer": "Фонд", "short_description": "Описание",
        "description": "Полное описание", "requirements": [], "criteria": [],
        "tags": [], "funding": "100 000 ₽", "deadline": "2027-01-01",
        "direction_ids": [], "sections": [],
    }).json()
    project = client.post("/projects", headers=owner_headers, json={"title": "Проект"}).json()
    application = client.post("/applications", headers=owner_headers, json={
        "title": "Заявка", "grant_id": grant["id"], "project_id": project["id"],
    }).json()
    app_id = application["id"]
    assert client.get(f"/applications/{app_id}", headers=other_headers).status_code == 404
    assert client.patch(f"/applications/{app_id}", headers=other_headers, json={"title": "Подмена"}).status_code == 404
    assert client.delete(f"/applications/{app_id}", headers=other_headers).status_code == 404
