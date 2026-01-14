import sys
import os
import json
from pathlib import Path

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Force Demo Mode to prevent DB/Redis connection attempts during import
os.environ["DEMO_NO_REDIS"] = "true"

try:
    from src.main import app
except ImportError as e:
    print(f"CRITICAL: Failed to import app: {e}")
    sys.exit(1)

def freeze_api():
    print("Generating OpenAPI snapshot...")
    try:
        openapi_schema = app.openapi()
    except Exception as e:
        print(f"CRITICAL: app.openapi() failed: {e}")
        sys.exit(1)
    
    # Validation
    if not openapi_schema.get("paths"):
        print("CRITICAL: OpenAPI schema has no paths!")
        sys.exit(1)
        
    target_dir = Path(__file__).parent.parent / "antigravity" / "03_api"
    target_dir.mkdir(parents=True, exist_ok=True)
    
    output_path = target_dir / "openapi.snapshot.json"
    
    with open(output_path, "w") as f:
        json.dump(openapi_schema, f, indent=2)
    
    print(f"SUCCESS: OpenAPI snapshot generated at: {output_path}")
    print(f"Stats: {len(openapi_schema['paths'])} paths exported.")

if __name__ == "__main__":
    freeze_api()
