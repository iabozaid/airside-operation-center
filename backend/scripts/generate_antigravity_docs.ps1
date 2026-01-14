$ErrorActionPreference = "Stop"

$SCRIPT_DIR = Split-Path $MyInvocation.MyCommand.Path -Parent
$ROOT_DIR = Split-Path $SCRIPT_DIR -Parent
$PYTHON = "python"
if (Test-Path "$ROOT_DIR\venv\Scripts\python.exe") {
    $PYTHON = "$ROOT_DIR\venv\Scripts\python.exe"
}

Write-Host "=== Backend Freeze Documentation Pipeline ==="
Write-Host "Root: $ROOT_DIR"
Write-Host "Python: $PYTHON"

# 1. Directories
Write-Host "`n[1/8] Creating Directories..."
$ANTIGRAVITY = "$ROOT_DIR\antigravity"
New-Item -ItemType Directory -Force -Path "$ANTIGRAVITY\00_index" | Out-Null
New-Item -ItemType Directory -Force -Path "$ANTIGRAVITY\01_architecture" | Out-Null
New-Item -ItemType Directory -Force -Path "$ANTIGRAVITY\02_services" | Out-Null
New-Item -ItemType Directory -Force -Path "$ANTIGRAVITY\03_api" | Out-Null
New-Item -ItemType Directory -Force -Path "$ANTIGRAVITY\04_tests" | Out-Null
New-Item -ItemType Directory -Force -Path "$ANTIGRAVITY\05_results" | Out-Null
New-Item -ItemType Directory -Force -Path "$ANTIGRAVITY\06_runbooks" | Out-Null
New-Item -ItemType Directory -Force -Path "$ANTIGRAVITY\07_evidence" | Out-Null

# 2. Preflight Evidence
Write-Host "`n[2/8] Collection Evidence (Pre-Flight)..."
& $PYTHON "$SCRIPT_DIR\collect_evidence.py" "preflight"

# 3. Freeze OpenAPI
Write-Host "`n[3/8] Freezing OpenAPI Snapshot..."
$env:DEMO_NO_REDIS="true"
$env:DEMO_NO_DB="true" # Strict isolation
& $PYTHON "$SCRIPT_DIR\freeze_openapi.py"
$env:DEMO_NO_REDIS=$null
$env:DEMO_NO_DB=$null

# 4. Inventory Scan
Write-Host "`n[4/8] Scanning Codebase Inventory..."
& $PYTHON "$SCRIPT_DIR\scan_inventory.py"

# 5. Run Tests
Write-Host "`n[5/8] Running Tests (Best Effort)..."
$RESULTS_DIR = "$ANTIGRAVITY\05_results"
$JUNIT_TMP = "$ROOT_DIR\pytest-junit.xml"
$COV_TMP = "$ROOT_DIR\coverage.xml" # Pytest usually puts in root or we specify
$CONSOLE_LOG = "$RESULTS_DIR\pytest-console.txt"

# Cleanup artifacts strictly
if (Test-Path $JUNIT_TMP) { Remove-Item $JUNIT_TMP }
if (Test-Path $COV_TMP) { Remove-Item $COV_TMP }

try {
    $env:DEMO_NO_REDIS="true" # Tests usually need mocks or demo mode
    # Run pytest, capturing output to console file AND allowing failure without script exit
    # We use Invoke-Expression or similar to avoid Stop on exit code 1
    # Actually just wrapping in try/catch or using Start-Process logic
    # PowerShell & operator stops if exit code non-zero with ErrorActionPreference Stop
    # So we temporarily relax preference or use try/catch block for external process?
    # External process non-zero exit doesn't always trigger throw in PS unless checks enabled.
    # But just in case:
    
    # We want to capture stdout/stderr to file
    & $PYTHON -m pytest "$ROOT_DIR" --junitxml="$JUNIT_TMP" --cov --cov-report=xml:"$COV_TMP" 2>&1 | Out-File -FilePath $CONSOLE_LOG -Encoding utf8
} catch {
    Write-Warning "Pytest execution encountered system error: $_"
    # Capture exception to console log if file mapping failed
    $_ | Out-File -FilePath $CONSOLE_LOG -Append -Encoding utf8
}
$env:DEMO_NO_REDIS=$null

# Check artifacts
$has_junit = (Test-Path $JUNIT_TMP)
$has_cov = (Test-Path $COV_TMP)

if ($has_junit -or $has_cov) {
    Write-Host "Tests Ran (Artifacts detected)."
    if ($has_junit) { Move-Item $JUNIT_TMP "$RESULTS_DIR\pytest-junit.xml" -Force }
    if ($has_cov) { Move-Item $COV_TMP "$RESULTS_DIR\coverage.xml" -Force }
} else {
    Write-Host "Tests Cannot Run (No artifacts produced)."
    "Tests failed to start or produce artifacts." | Out-File "$RESULTS_DIR\pytest-junit.NOT_GENERATED.txt" -Encoding utf8
    "Tests failed to start or produce artifacts." | Out-File "$RESULTS_DIR\coverage.NOT_GENERATED.txt" -Encoding utf8
}

# 6. Post-Run Evidence
Write-Host "`n[6/8] Collecting Evidence (Post-Run)..."
& $PYTHON "$SCRIPT_DIR\collect_evidence.py" "postrun"

# 7. Render Docs
Write-Host "`n[7/8] Rendering Markdown Docs..."
& $PYTHON "$SCRIPT_DIR\render_docs.py"

# 8. Validation
Write-Host "`n[8/8] Validating Artifacts..."
& $PYTHON "$SCRIPT_DIR\validate_artifacts.py"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== SUCCESS: Antigravity Docs Generated ==="
} else {
    Write-Host "`n=== FAILURE: Validation Errors Detected ==="
    exit 1
}
