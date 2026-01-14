import json
import os
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

BASE = Path(__file__).parent.parent / "antigravity"

def fail(msg):
    print(f"FAILURE: {msg}")
    sys.exit(1)

def check_file(path, min_bytes=0):
    if not path.exists():
        fail(f"Missing {path}")
    if path.stat().st_size <= min_bytes:
        fail(f"Empty {path}")
    return True

def validate():
    print("Validating Artifacts...")
    
    # 1. OpenAPI Snapshot
    openapi_path = BASE / "03_api" / "openapi.snapshot.json"
    check_file(openapi_path, 50)
    try:
        with open(openapi_path, "r") as f:
            data = json.load(f)
            if "openapi" not in data or "paths" not in data:
                fail("OpenAPI snapshot missing required keys (openapi, paths)")
            path_count = len(data["paths"])
            if path_count == 0:
                fail("OpenAPI snapshot has 0 paths!")
            print(f"PASS: OpenAPI ({path_count} paths)")
    except json.JSONDecodeError:
        fail("OpenAPI snapshot invalid JSON")

    # 2. Inventory
    inv_path = BASE / "00_index" / "inventory.json"
    check_file(inv_path, 10)
    try:
        with open(inv_path, "r") as f:
            data = json.load(f)
            required = ["contexts", "services", "repositories"]
            for r in required:
                if r not in data: fail(f"Inventory missing key: {r}")
            # Check sort
            if data["contexts"] != sorted(data["contexts"]):
                fail("Inventory contexts not sorted")
            print("PASS: Inventory")
    except json.JSONDecodeError:
        fail("Inventory invalid JSON")

    # 3. Endpoints MD
    ep_md = BASE / "03_api" / "endpoints.md"
    check_file(ep_md, 10)
    content = ep_md.read_text(encoding="utf-8")
    if "Total endpoints:" not in content:
        fail("endpoints.md missing 'Total endpoints:' header")
    
    # If openapi count > 0, we expect content
    # Simple check: Does it have "## " headers?
    if path_count > 0:
        if "## GET" not in content and "## POST" not in content and "## PUT" not in content and "## DELETE" not in content:
             fail("endpoints.md does not enumerate endpoints despite paths > 0")
    print("PASS: Endpoints Doc")

    # 4. Test Results logic
    res_dir = BASE / "05_results"
    
    junit_path = res_dir / "pytest-junit.xml"
    marker_junit = res_dir / "pytest-junit.NOT_GENERATED.txt"
    
    if junit_path.exists():
        # Validate XML
        try:
             ET.parse(junit_path)
             print("PASS: Test Results (JUnit XML valid)")
        except ET.ParseError:
             fail("pytest-junit.xml is corrupted")
    elif marker_junit.exists():
         print("PASS: Test Results (Not Ran Marker Verified)")
    else:
         fail("Missing Test Artifacts (Neither XML nor Marker found)")

    # 5. Coverage logic (Similar)
    cov_path = res_dir / "coverage.xml"
    marker_cov = res_dir / "coverage.NOT_GENERATED.txt"
    
    if cov_path.exists():
        check_file(cov_path, 10)
    elif marker_cov.exists():
        pass
    else:
        # We enforce coverage marker if xml missing? Plan implies yes.
        fail("Missing Coverage Artifacts (Neither XML nor Marker found)")
        
    print("SUCCESS: All artifacts validated.")
    sys.exit(0)

if __name__ == "__main__":
    validate()
