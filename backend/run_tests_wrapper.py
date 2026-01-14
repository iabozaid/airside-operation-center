import subprocess
import sys

with open("test_wrapper_output.txt", "w", encoding="utf-8") as f:
    result = subprocess.run(
        [sys.executable, "-m", "pytest", "tests/test_demo_mode_no_db_calls.py", "-v"],
        stdout=f,
        stderr=subprocess.STDOUT
    )
print(f"Test finished with code {result.returncode}")
