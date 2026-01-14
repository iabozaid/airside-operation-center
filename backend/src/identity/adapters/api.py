from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer, SecurityScopes
from pydantic import BaseModel
from typing import List, Optional
from src.identity.service import AuthService, InvalidCredentialsError, InvalidTokenError, InsufficientPermissionsError, AuthError

router = APIRouter(tags=["Identity"])
service = AuthService()

# Security Scheme (for Swagger UI, though we use JSON login)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

# --- Models ---
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    user_id: str
    username: str
    roles: List[str]

class CreateUserRequest(BaseModel):
    username: str
    password: str
    roles: List[str]

# --- Dependencies ---

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        user = service.validate_token(token)
        return user
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

def require_role(role: str):
    def role_checker(user: dict = Depends(get_current_user)):
        roles = user.get("roles", [])
        if role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation requires role: {role}"
            )
        return user
    return role_checker

# --- Routes ---

@router.post("/auth/login", response_model=TokenResponse)
async def login(creds: LoginRequest):
    try:
        token = await service.login(creds.username, creds.password)
        return token
    except InvalidCredentialsError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/auth/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "user_id": current_user["user_id"],
        "username": current_user["username"],
        "roles": current_user["roles"]
    }

@router.post("/admin/users", response_model=UserResponse)
async def create_new_user(
    user_data: CreateUserRequest, 
    admin_user: dict = Depends(require_role("admin"))
):
    try:
        user = await service.create_user(user_data.username, user_data.password, user_data.roles)
        return {
            "user_id": user["id"],
            "username": user["username"],
            "roles": user["roles"]
        }
    except AuthError as e:
        raise HTTPException(status_code=400, detail=str(e))
