import sys
import os
import json

# Add backend to path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.main import app

def freeze_api():
    openapi_schema = app.openapi()
    
    output_path = os.path.join(os.path.dirname(__file__), "..", "docs", "openapi.snapshot.json")
    output_path = os.path.abspath(output_path)
    
    with open(output_path, "w") as f:
        json.dump(openapi_schema, f, indent=2)
    
    print(f"OpenAPI snapshot generated at: {output_path}")

if __name__ == "__main__":
    freeze_api()
