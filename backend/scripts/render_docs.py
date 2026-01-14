import json
import os
import xml.etree.ElementTree as ET
from pathlib import Path

BASE = Path(__file__).parent.parent / "antigravity"

def load_json(path):
    if not path.exists(): return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def render_api_docs():
    openapi = load_json(BASE / "03_api" / "openapi.snapshot.json")
    paths = openapi.get("paths", {})
    
    # Endpoints MD
    lines = ["# Endpoints Inventory\n"]
    lines.append(f"Total endpoints: {len(paths)}\n")
    
    if paths:
        # Sort keys for determinism
        for path in sorted(paths.keys()):
            methods = paths[path]
            for method in sorted(methods.keys()):
                details = methods[method]
                summary = details.get("summary", "No summary")
                tags = ", ".join(sorted(details.get("tags", [])))
                lines.append(f"## {method.upper()} {path}")
                lines.append(f"- **Summary**: {summary}")
                lines.append(f"- **Tags**: {tags}")
                lines.append("")
    else:
        lines.append("No endpoints found in OpenAPI snapshot.")
    
    with open(BASE / "03_api" / "endpoints.md", "w") as f:
        f.write("\n".join(lines))

def render_service_catalog():
    inv = load_json(BASE / "00_index" / "inventory.json")
    lines = ["# Service Catalog\n"]
    
    # Contexts
    if "contexts" in inv:
        lines.append("\n## Contexts")
        for ctx in sorted(inv["contexts"]):
             lines.append(f"- {ctx}")

    if "services" in inv:
        lines.append("\n## Domain Services")
        for svc in inv["services"]:
            lines.append(f"- **{svc['name']}** (`{svc['file']}`)")
    
    if "repositories" in inv:
        lines.append("\n## Repositories")
        for repo in inv["repositories"]:
            lines.append(f"- **{repo['name']}** (`{repo['file']}`)")
            
    with open(BASE / "02_services" / "service_catalog.md", "w") as f:
        f.write("\n".join(lines))

def render_test_results():
    lines = ["# Latest Test Run\n"]
    results_dir = BASE / "05_results"
    
    # Check for marker
    marker_junit = results_dir / "pytest-junit.NOT_GENERATED.txt"
    junit_xml = results_dir / "pytest-junit.xml"
    
    if marker_junit.exists():
        lines.append("## Status: Tests Cannot Run")
        lines.append("\n**Reason**:")
        try:
             lines.append(f"`{marker_junit.read_text().strip()}`")
        except:
             lines.append("Unknown (Marker exists but empty)")
        
        # Point to console log
        lines.append("\nSee `pytest-console.txt` for error details.")
        
    elif junit_xml.exists():
        lines.append("## Status: Tests Ran")
        # Best effort parse
        try:
            tree = ET.parse(junit_xml)
            root = tree.getroot()
            # Usually <testsuite> or <testsuites>
            # Standard JUnit info: errors, failures, skipped, tests, time
            if root.tag == "testsuites":
                 # Sum up
                 tests = sum(int(ts.attrib.get('tests', 0)) for ts in root)
                 failures = sum(int(ts.attrib.get('failures', 0)) for ts in root)
                 errors = sum(int(ts.attrib.get('errors', 0)) for ts in root)
                 skipped = sum(int(ts.attrib.get('skipped', 0)) for ts in root)
            else:
                 tests = int(root.attrib.get('tests', 0))
                 failures = int(root.attrib.get('failures', 0))
                 errors = int(root.attrib.get('errors', 0))
                 skipped = int(root.attrib.get('skipped', 0))
            
            lines.append(f"- **Total**: {tests}")
            lines.append(f"- **Passed**: {tests - failures - errors - skipped}")
            lines.append(f"- **Failed**: {failures}")
            lines.append(f"- **Errors**: {errors}")
            lines.append(f"- **Skipped**: {skipped}")
            
            if failures > 0 or errors > 0:
                lines.append("\n### Failures/Errors")
                # List failing cases
                for case in root.findall(".//testcase"):
                    if case.find("failure") is not None or case.find("error") is not None:
                        name = case.attrib.get("name", "unknown")
                        classname = case.attrib.get("classname", "unknown")
                        lines.append(f"- `{classname}::{name}`")

        except Exception as e:
            lines.append(f"\nError parsing JUnit XML: {e}")
            
    else:
        lines.append("## Status: Unknown")
        lines.append("No run artifacts or markers found.")

    with open(results_dir / "latest-test-run.md", "w") as f:
        f.write("\n".join(lines))

def main():
    render_api_docs()
    render_service_catalog()
    render_test_results()
    print("Docs rendered.")

if __name__ == "__main__":
    main()
