import pytest
import sys
sys.path.insert(0, '/Users/tanvir/Hunt-X/backend')

from main import app
from models.base import Base
from dependencies import get_db

TEST_DATABASE_URL = "sqlite:///:memory:"
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    from fastapi.testclient import TestClient
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture(scope="module")
def auth_token(client):
    res = client.post("/api/auth/register", json={
        "email": "prof_test@example.com",
        "password": "SecurePass123!",
        "name": "Prof Test"
    })
    return res.json()["access_token"]

class TestProfiles:
    def test_create_profile(self, client, auth_token):
        res = client.post("/api/profiles/", json={
            "name": "Frontend Roles",
            "target_roles": ["React Developer", "Frontend Engineer"],
            "preferred_location": "Remote",
            "min_salary": 80000,
            "remote_preference": "remote"
        }, headers={"Authorization": f"Bearer {auth_token}"})
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["profile"]["name"] == "Frontend Roles"

    def test_list_profiles(self, client, auth_token):
        client.post("/api/profiles/", json={
            "name": "Profile 1", "target_roles": []
        }, headers={"Authorization": f"Bearer {auth_token}"})
        res = client.get("/api/profiles/", headers={"Authorization": f"Bearer {auth_token}"})
        assert res.status_code == 200
        assert len(res.json()["profiles"]) >= 1

    def test_get_profile(self, client, auth_token):
        create_res = client.post("/api/profiles/", json={
            "name": "Profile 1", "target_roles": []
        }, headers={"Authorization": f"Bearer {auth_token}"})
        prof_id = create_res.json()["profile"]["id"]
        res = client.get(f"/api/profiles/{prof_id}", headers={"Authorization": f"Bearer {auth_token}"})
        assert res.status_code == 200
        assert res.json()["profile"]["name"] == "Profile 1"

    def test_update_profile(self, client, auth_token):
        create_res = client.post("/api/profiles/", json={
            "name": "Profile 1", "target_roles": []
        }, headers={"Authorization": f"Bearer {auth_token}"})
        prof_id = create_res.json()["profile"]["id"]
        res = client.put(f"/api/profiles/{prof_id}", json={
            "name": "Updated Name"
        }, headers={"Authorization": f"Bearer {auth_token}"})
        assert res.status_code == 200
        assert res.json()["profile"]["name"] == "Updated Name"

    def test_delete_profile(self, client, auth_token):
        create_res = client.post("/api/profiles/", json={
            "name": "Profile 1", "target_roles": []
        }, headers={"Authorization": f"Bearer {auth_token}"})
        prof_id = create_res.json()["profile"]["id"]
        res = client.delete(f"/api/profiles/{prof_id}", headers={"Authorization": f"Bearer {auth_token}"})
        assert res.status_code == 200
        get_res = client.get(f"/api/profiles/{prof_id}", headers={"Authorization": f"Bearer {auth_token}"})
        assert get_res.status_code == 404

    def test_set_default_profile(self, client, auth_token):
        create_res = client.post("/api/profiles/", json={
            "name": "Profile 1", "target_roles": []
        }, headers={"Authorization": f"Bearer {auth_token}"})
        prof_id = create_res.json()["profile"]["id"]
        res = client.post(f"/api/profiles/{prof_id}/set-default", headers={"Authorization": f"Bearer {auth_token}"})
        assert res.status_code == 200
        list_res = client.get("/api/profiles/", headers={"Authorization": f"Bearer {auth_token}"})
        profiles = list_res.json()["profiles"]
        default = next((p for p in profiles if p["is_default"]), None)
        assert default is not None
        assert default["id"] == prof_id
