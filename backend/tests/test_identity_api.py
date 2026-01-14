from fastapi.testclient import TestClient
from src.main import app
from unittest.mock import AsyncMock, patch
import pytest

client = TestClient(app)

class TestIdentityAPI:
    
    def test_login_success(self):
        with patch("src.identity.adapters.api.service") as mock_service:
            mock_service.login = AsyncMock(return_value={"access_token": "fake-jwt", "token_type": "bearer"})
            
            resp = client.post("/auth/login", json={"username": "admin", "password": "password"})
            assert resp.status_code == 200
            assert resp.json() == {"access_token": "fake-jwt", "token_type": "bearer"}
    
    def test_login_failure(self):
        from src.identity.service import InvalidCredentialsError
        with patch("src.identity.adapters.api.service") as mock_service:
            mock_service.login = AsyncMock(side_effect=InvalidCredentialsError())
            
            resp = client.post("/auth/login", json={"username": "admin", "password": "wrong"})
            assert resp.status_code == 401
    
    def test_get_me_protected_no_token(self):
        resp = client.get("/auth/me")
        assert resp.status_code == 401
        
    def test_get_me_success(self):
        from src.identity.adapters.api import service
        
        # We need to mock validate_token which is called by get_current_user
        # Since get_current_user uses the global 'service', we patch it.
        with patch("src.identity.adapters.api.service") as mock_service:
            mock_service.validate_token.return_value = {
                "user_id": "u-1",
                "username": "admin",
                "roles": ["admin"]
            }
            
            resp = client.get("/auth/me", headers={"Authorization": "Bearer valid-token"})
            assert resp.status_code == 200
            assert resp.json()["username"] == "admin"

    def test_admin_create_user_success(self):
        with patch("src.identity.adapters.api.service") as mock_service:
             # Mock Current User as Admin
            mock_service.validate_token.return_value = {
                "user_id": "u-1",
                "username": "admin",
                "roles": ["admin"]
            }
            
            mock_service.create_user = AsyncMock(return_value={
                "id": "new-u",
                "username": "newuser",
                "roles": ["operator"]
            })
            
            resp = client.post("/admin/users", 
                               headers={"Authorization": "Bearer admin-token"},
                               json={"username": "newuser", "password": "pw", "roles": ["operator"]})
            
            assert resp.status_code == 200
            assert resp.json()["username"] == "newuser"

    def test_admin_create_user_forbidden(self):
        with patch("src.identity.adapters.api.service") as mock_service:
             # Mock Current User as Operator (Not Admin)
            mock_service.validate_token.return_value = {
                "user_id": "u-2",
                "username": "op",
                "roles": ["operator"]
            }
            
            resp = client.post("/admin/users", 
                               headers={"Authorization": "Bearer op-token"},
                               json={"username": "newuser", "password": "pw", "roles": ["operator"]})
            
            assert resp.status_code == 403
