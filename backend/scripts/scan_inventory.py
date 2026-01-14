import ast
import os
import json
from pathlib import Path

# Config
SRC_DIR = Path(__file__).parent.parent / "src"
OUTPUT_FILE = Path(__file__).parent.parent / "antigravity" / "00_index" / "inventory.json"

inventory = {
    "contexts": [],
    "services": [],
    "repositories": [],
    "events": [], # Event types found in publish calls
    "env_vars": []
}

def scan_file(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read(), filename=str(filepath))
            
        rel_path = filepath.relative_to(SRC_DIR).as_posix()
        
        for node in ast.walk(tree):
            # Classes
            if isinstance(node, ast.ClassDef):
                if node.name.endswith("Service"):
                    inventory["services"].append({"name": node.name, "file": rel_path})
                elif node.name.endswith("Repository"):
                    inventory["repositories"].append({"name": node.name, "file": rel_path})
                elif "Settings" in node.name:
                     # Inspect fields for env vars
                     for item in node.body:
                         if isinstance(item, ast.AnnAssign) and isinstance(item.target, ast.Name):
                             inventory["env_vars"].append({"name": item.target.id, "source": node.name})

            # Event Publishing (Heuristic)
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Attribute) and node.func.attr == "publish":
                     # Look for event_type arg
                     if node.args:
                         arg0 = node.args[0]
                         if isinstance(arg0, ast.Constant): # python 3.8+
                             inventory["events"].append(arg0.value)
                         elif isinstance(arg0, ast.Str): # older
                             inventory["events"].append(arg0.s)
                     # Also keyword args
                     for k in node.keywords:
                         if k.arg == "event_type":
                             if isinstance(k.value, ast.Constant):
                                 inventory["events"].append(k.value.value)

    except Exception as e:
        print(f"Skipping {filepath}: {e}")

def main():
    print(f"Scanning {SRC_DIR}...")
    
    # 1. Discover Contexts (Top level dirs in src)
    if SRC_DIR.exists():
        for item in SRC_DIR.iterdir():
            if item.is_dir() and not item.name.startswith("__"):
                inventory["contexts"].append(item.name)
    
    # 2. Walk Files
    for root, _, files in os.walk(SRC_DIR):
        for file in files:
            if file.endswith(".py"):
                scan_file(Path(root) / file)

    # 3. Deterministic Sort / Dedupe
    inventory["contexts"].sort()
    inventory["services"].sort(key=lambda x: x["name"])
    inventory["repositories"].sort(key=lambda x: x["name"])
    inventory["events"] = sorted(list(set(inventory["events"])))
    inventory["env_vars"].sort(key=lambda x: x["name"])

    # 4. Write
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(inventory, f, indent=2)
    
    print(f"Inventory written to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
