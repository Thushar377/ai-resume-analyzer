# backend/tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

# Test database
SQLALCHEMY_TEST_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=engine)

client = TestClient(app)

# Test data
TEST_USER = {
    "email": "test@example.com",
    "username": "testuser",
    "full_name": "Test User",
    "password": "TestPass123",
    "confirm_password": "TestPass123"
}

class TestAuth:
    def test_register_success(self):
        response = client.post("/api/v1/auth/register", json=TEST_USER)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == TEST_USER["email"]
        assert "id" in data
        assert "hashed_password" not in data

    def test_register_duplicate_email(self):
        client.post("/api/v1/auth/register", json=TEST_USER)
        response = client.post("/api/v1/auth/register", json=TEST_USER)
        assert response.status_code == 409

    def test_login_success(self):
        client.post("/api/v1/auth/register", json=TEST_USER)
        response = client.post("/api/v1/auth/login", json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self):
        response = client.post("/api/v1/auth/login", json={
            "email": TEST_USER["email"],
            "password": "wrongpassword"
        })
        assert response.status_code == 401

    def test_get_me_authenticated(self):
        client.post("/api/v1/auth/register", json=TEST_USER)
        login_response = client.post("/api/v1/auth/login", json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        })
        token = login_response.json()["access_token"]
        
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["email"] == TEST_USER["email"]

    def test_get_me_unauthenticated(self):
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 403

    def test_weak_password_validation(self):
        weak_user = {**TEST_USER, "email": "weak@test.com", "password": "weak", "confirm_password": "weak"}
        response = client.post("/api/v1/auth/register", json=weak_user)
        assert response.status_code == 422