from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from src.identity.repository import UserRepository
from src.shared.event_bus import event_bus
from src.infrastructure.settings import settings
import uuid
import logging

logger = logging.getLogger(__name__)

# Constants
# Read secret from pydantic-settings
SECRET_KEY = settings.AUTH_SECRET
if not SECRET_KEY:
    raise RuntimeError("AUTH_SECRET is empty. Check .env AUTH_SECRET value.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# --- PREPARE CRYPT CONTEXT ---
# Use pbkdf2_sha256 to avoid bcrypt environmental issues
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# Generate a valid fallback hash at module load time to ensure it works
FALLBACK_HASH = pwd_context.hash("fallback_timing_mitigation_password")

class AuthError(Exception):
    pass

class InvalidCredentialsError(AuthError):
    def __init__(self):
        super().__init__("Invalid username or password")

class InvalidTokenError(AuthError):
    def __init__(self):
        super().__init__("Invalid token")

class InsufficientPermissionsError(AuthError):
    def __init__(self, required: str, actual: List[str]):
        super().__init__(f"User missing required role: {required}. Has: {actual}")


class AuthService:
    """
    Domain Service for Identity Context.
    Handles Authentication (JWT) and User Management.
    """

    def __init__(self, repository: Optional[UserRepository] = None):
        self.repository = repository or UserRepository()
        # Use module-level context
        self.pwd_context = pwd_context

    def _verify_password(self, plain_password, hashed_password):
        return self.pwd_context.verify(plain_password, hashed_password)

    def _get_password_hash(self, password):
        return self.pwd_context.hash(password)

    def _create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        now = datetime.now(timezone.utc)
        
        # Ensure timestamps are integers for JWT compliance/serialization
        to_encode["iat"] = int(now.timestamp())

        if expires_delta:
            expire = now + expires_delta
        else:
            expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            
        to_encode["exp"] = int(expire.timestamp())

        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    async def login(self, username: str, password: str) -> Dict[str, str]:
        username = (username or "").strip()

        # Timing Mitigation: Always perform verification
        if not username:
             # Fake verify
             self._verify_password(password or "dummy", FALLBACK_HASH)
             raise InvalidCredentialsError()

        user = await self.repository.get_user_by_username(username)

        if user:
            pwd_hash = user["password_hash"]
        else:
            pwd_hash = FALLBACK_HASH

        # Verify
        is_valid = self._verify_password(password, pwd_hash)

        if not user or not is_valid:
            raise InvalidCredentialsError()

        # Get Roles
        user_with_roles = await self.repository.get_user_with_roles(user["id"])
        roles = user_with_roles.get("roles", [])

        # Emit Event
        await event_bus.publish(
            event_type="identity.user_login_succeeded",
            source_context="identity",
            correlation_id=str(uuid.uuid4()),
            entity_refs={"userId": str(user["id"])},
            payload={
                "username": username,
                "roles": roles,
            },
        )

        # Create Token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        token_data = {
            "sub": str(user["id"]),
            "username": str(username),
            "roles": roles,
        }
        access_token = self._create_access_token(
            data=token_data, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    async def create_user(self, username, password, roles: List[str]) -> Dict[str, Any]:
        """Admin only creation"""
        existing = await self.repository.get_user_by_username(username)
        if existing:
            raise AuthError(f"User {username} already exists")

        hashed_pw = self._get_password_hash(password)
        user_data = {
            "username": username,
            "password_hash": hashed_pw,
        }

        user_id = await self.repository.create_user(user_data, roles)

        await event_bus.publish(
            event_type="identity.user_created",
            source_context="identity",
            correlation_id=str(uuid.uuid4()),
            entity_refs={"userId": str(user_id)},
            payload={
                "username": username,
                "roles": roles,
            },
        )

        return {"id": user_id, "username": username, "roles": roles}

    def validate_token(self, token: str) -> Dict[str, Any]:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

            user_id: str = payload.get("sub")
            exp_claim = payload.get("exp")

            if user_id is None or exp_claim is None:
                raise InvalidTokenError()

            # Normalize roles
            raw_roles = payload.get("roles", [])
            roles = [str(r) for r in raw_roles] if isinstance(raw_roles, list) else []

            return {
                "user_id": user_id,
                "username": payload.get("username"),
                "roles": roles,
            }
        except JWTError:
            raise InvalidTokenError()
