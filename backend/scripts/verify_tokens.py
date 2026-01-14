import os
import re
import sys

# Authority: Zero Tolerance for hardcoded values.
# Scans src/components, src/layout, src/pages (and src/styles/global.css exceptions)

FORBIDDEN_PATTERNS = [
    (r'#([A-Fa-f0-9]{3}){1,2}\b', "Hex Color Literal"),
    (r'\brgb\s*\(', "RGB Literal"),
    (r'\brgba\s*\(', "RGBA Literal"),
    (r'\bhsl\s*\(', "HSL Literal"),
    (r'\bhsla\s*\(', "HSLA Literal"),
    (r'\b\d+(?:\.\d+)?px\b', "Pixel Spacing (except 0px or 1px border)"),
    (r'\b\d+(?:\.\d+)?rem\b', "REM Spacing"),
    (r'\b\d+(?:\.\d+)?em\b', "EM Spacing"),
]

# Allow 1px for borders and 0px
ALLOW_LIST = ['1px', '0px', '0']

SCAN_DIRS = [
    'frontend/src/components',
    'frontend/src/layout',
    'frontend/src/pages',
]

def scan_file(filepath):
    violations = []
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        for i, line in enumerate(lines):
            line_num = i + 1
            # Skip comments roughly
            if line.strip().startswith('/*') or line.strip().startswith('//'):
                continue

            for pattern, name in FORBIDDEN_PATTERNS:
                matches = re.finditer(pattern, line)
                for match in matches:
                    val = match.group(0)
                    if val in ALLOW_LIST:
                        continue
                    if 'px' in val and float(val.replace('px', '')) == 0:
                        continue
                    
                    violations.append(f"{filepath}:{line_num} - {name} found: '{val}'")
    return violations

def main():
    print("Running Token Discipline Scan...")
    root_dir = os.getcwd()
    all_violations = []

    for d in SCAN_DIRS:
        path = os.path.join(root_dir, d)
        if not os.path.exists(path):
            print(f"Warning: Path not found {path}")
            continue
            
        for root, _, files in os.walk(path):
            for file in files:
                if file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.css'):
                    # Skip .module.css if we want strictness there too? Yes.
                    full_path = os.path.join(root, file)
                    all_violations.extend(scan_file(full_path))

    if all_violations:
        print(f"FAILURE: Found {len(all_violations)} token violations.")
        for v in all_violations:
            print(v)
        sys.exit(1)
    else:
        print("SUCCESS: Zero token violations found.")
        sys.exit(0)

if __name__ == "__main__":
    main()
