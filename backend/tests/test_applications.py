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
    # Register a user (only once per module)
    res = client.post("/api/auth/register", json={
        "email": "app_test@example.com",
        "password": "SecurePass123!",
        "name": "App Test"
    })
    return res.json()["access_token"]

class TestApplications:
    def test_create_application(self, client, auth_token):
        res = client.post("/api/applications/", json={
            "company": "Acme Corp",
            "role": "Senior Engineer",
            "stage": "applied",
            "location": "Remote"
        }, headers={"Authorization": f"Bearer {auth_token}"})
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["application"]["company"] == "Acme Corp"

    def test_list_applications(self, client, auth_token):
        # Create first
        client.post("/api/applications/", json={
            "company": "Acme Corp", "role": "Engineer"
        }, headers={"Authorization": f"Bearer {auth_token}"})
        # List
        res = client.get("/api/applications/", headers={"Authorization": f"Bearer {auth_token}"})
        assert res.status_code == 200
        data = res.json()
        assert len(data["applications"]) >= 1

    def test_get_application(self, client, auth_token):
        create_res = client.post("/api/applications/", json={
            "company": "Acme Corp", "role": "Engineer"
        }, headers={"Authorization": f"Bearer {auth_token}"})
        app_id = create_res.json()["application"]["id"]
        res = client.get(f"/api/applications/{app_id}", headers={"Authorization": f"Bearer {auth_token}"})
        assert res.status_code == 200
        assert res.json()["application"]["company"] == "Acme Corp"

    def test_update_application(self, client, auth_token):
        create_res = client.post("/api/applications/", json={
            "company": "Acme Corp", "role": "Engineer"
        }, headers={"Authorization": f"Bearer {auth_token}"})
        app_id = create_res.json()["application"]["id"]
        res = client.put(f"/api/applications/{app_id}", json={
            "stage": "interview"
        }, headers={"Authorization": f"Bearer {auth_token}"})
        assert res.status_code == 200
        assert res.json()["application"]["stage"] == "interview"

    def test_delete_application(self, client, auth_token):
        create_res = client.post("/api/applications/", json={
            "company": "Acme Corp", "role": "Engineer"
        }, headers={"Authorization": f"Bearer {auth_token}"})
        app_id = create_res.json()["application"]["id"]
        res = client.delete(f"/api/applications/{app_id}", headers={"Authorization": f"Bearer {auth_token}"})
        assert res.status_code == 200
        # Verify deletion
        get_res = client.get(f"/api/applications/{app_id}", headers={"Authorization": f"Bearer {auth_token}"})
        assert get_res.status_code == 404

    def test_get_nonexistent_application(self, client, auth_token):
        res = client.get("/api/applications/nonexistent-id", headers={"Authorization": f"Bearer {auth_token}"})
        assert res.status_code == 404
