from src.identity.service import AuthService
from src.infrastructure.settings import settings
from passlib.context import CryptContext
import logging

logger = logging.getLogger(__name__)

async def seed_admin_if_enabled():
    """
    Seeds an initial admin user if enabled and missing.
    Uses pbkdf2_sha256 hashing (no bcrypt).
    """
    if not settings.SEED_ADMIN:
        return

    service = AuthService()
    try:
        admin_username = settings.ADMIN_USERNAME
        admin_password = settings.ADMIN_PASSWORD

        user = await service.repository.get_user_by_username(admin_username)
        if user:
            logger.info("Admin user already exists. Skipping seed.")
            return

        logger.info("Seeding initial admin user...")

        pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
        admin_hash = pwd_context.hash(admin_password)

        user_data = {
            "username": admin_username,
            "password_hash": admin_hash,
        }
        roles = ["admin"]

        await service.repository.create_user(user_data, roles)

        logger.info("Admin user seeded successfully.")
    except Exception as e:
        logger.error(f"Failed to seed admin user: {e}")
