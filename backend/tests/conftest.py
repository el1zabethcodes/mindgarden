import os
import secrets
import sys
from pathlib import Path

# make backend imports resolvable when pytest runs from the repo root
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

os.environ.setdefault("SECRET_KEY", "test-secret-key")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

import cache
import models
from database import Base, get_db
import main as app_module

@pytest.fixture()
def db_session():
    # one shared in-memory database per test, never touching garden.db
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def fresh_cache():
    # cached tags from one test must not leak into the next
    cache.clear()
    yield
    cache.clear()

@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app_module.app.dependency_overrides[get_db] = override_get_db
    # plain TestClient (no context manager) skips the lifespan so the
    # real engine never gets touched during tests
    yield TestClient(app_module.app)
    app_module.app.dependency_overrides.clear()

@pytest.fixture()
def garden_password():
    # disposable password generated per test run; overridable via TEST_PASSWORD
    return os.environ.get("TEST_PASSWORD") or secrets.token_urlsafe(12)

@pytest.fixture()
def auth_headers(client, garden_password):
    client.post("/api/auth/register", json={
        "username": "tester",
        "email": "tester@mindgarden.local",
        "password": garden_password,
    })
    res = client.post("/api/auth/login", json={"username": "tester", "password": garden_password})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
