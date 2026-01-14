import pytest
from unittest.mock import AsyncMock, patch
from src.infrastructure.settings import settings
from src.identity.bootstrap import seed_admin_if_enabled

@pytest.mark.asyncio
async def test_seed_admin_disabled():
    with patch.object(settings, 'SEED_ADMIN', False):
        with patch('src.identity.bootstrap.AuthService') as MockAuthService:
            await seed_admin_if_enabled()
            MockAuthService.assert_not_called()

@pytest.mark.asyncio
async def test_seed_admin_enabled_user_exists():
    with patch.object(settings, 'SEED_ADMIN', True):
        with patch('src.identity.bootstrap.AuthService') as MockAuthService:
            mock_service = MockAuthService.return_value
            # User exists
            mock_service.repository.get_user_by_username = AsyncMock(return_value={"id": "123"})
            
            await seed_admin_if_enabled()
            
            mock_service.repository.create_user.assert_not_called()

@pytest.mark.asyncio
async def test_seed_admin_enabled_create_user():
    with patch.object(settings, 'SEED_ADMIN', True):
        with patch('src.identity.bootstrap.AuthService') as MockAuthService:
            mock_service = MockAuthService.return_value
            # User missing
            mock_service.repository.get_user_by_username = AsyncMock(return_value=None)
            mock_service.repository.create_user = AsyncMock()
            
            await seed_admin_if_enabled()
            
            mock_service.repository.create_user.assert_called_once()
