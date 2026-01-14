import os
from src.infrastructure.settings import settings

def is_demo_mode() -> bool:
    """
    Canonical source of truth for Demo Mode.
    If True, the application MUST NOT:
    1. Connect to Database
    2. Connect to Redis
    3. Start Consumers
    
    It SHOULD:
    1. Return DTO-faithful Mock Data
    2. Log "Demo Mode" access
    """
    # Check Environment Variable directly (Strong Override)
    if os.getenv("DEMO_MODE", "").lower() in ("true", "1", "yes"):
        return True
        
    # Check Settings (Legacy Ops Proxy)
    # If Redis is disabled, we are effectively in a standalone demo
    if settings.DEMO_NO_REDIS:
        return True
        
    return False
