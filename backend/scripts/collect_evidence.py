import sys
import os
import platform
import subprocess
import shutil
from pathlib import Path
import datetime

def run_command(cmd):
    try:
        if platform.system() == "Windows":
             # Use shell=True for windows commands mostly, or just direct
             res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        else:
             res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return res.stdout.strip()
    except Exception as e:
        return f"Error: {e}"

def collect_evidence(phase):
    target_dir = Path(__file__).parent.parent / "antigravity" / "07_evidence"
    target_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.datetime.now(datetime.UTC).isoformat()
    
    # 1. Environment Info (Redacted)
    with open(target_dir / "environment.txt", "w") as f:
        f.write(f"Timestamp: {timestamp}\n")
        f.write(f"Phase: {phase}\n")
        f.write(f"OS: {platform.system()} {platform.release()}\n")
        f.write(f"Python: {sys.version}\n")
        f.write("\n--- Env Vars (Names Only) ---\n")
        for key in sorted(os.environ.keys()):
            f.write(f"{key}=<REDACTED>\n")

    # 2. Pip Freeze
    pip_out = run_command("pip freeze")
    with open(target_dir / "pip-freeze.txt", "w") as f:
        f.write(pip_out)

    # 3. Git Info
    with open(target_dir / "git-head.txt", "w") as f:
        f.write(run_command("git rev-parse HEAD"))
    
    with open(target_dir / "git-status.txt", "w") as f:
        f.write(run_command("git status --porcelain"))
        
    # 4. Infrastructure Reachability
    # Redis
    # Check for redis-cli
    redis_info = "redis-cli not found"
    if shutil.which("redis-cli"):
        redis_info = run_command("redis-cli INFO SERVER")
        # Sanitize generic secrets if they appear? INFO SERVER usually clean.
    else:
        # Fallback TCP check?
        import socket
        try:
             s = socket.create_connection(("localhost", 6379), timeout=1)
             s.close()
             redis_info = "Redis unreachable via CLI, but TCP 6379 is OPEN."
        except:
             redis_info = "Redis unreachable via CLI and TCP 6379 closed."

    with open(target_dir / "redis-info.txt", "w") as f:
        f.write(redis_info)
        
    # Postgres
    # Check for psql
    pg_info = "psql not found"
    if shutil.which("psql"):
        pg_info = run_command('psql --no-password -c "select version()"')
    else:
        # Just report missing
        pg_info = "psql not found. Skipping version check."
        
    with open(target_dir / "postgres-info.txt", "w") as f:
        f.write(pg_info)

    print(f"Evidence collected in {target_dir}")

if __name__ == "__main__":
    phase = sys.argv[1] if len(sys.argv) > 1 else "manual"
    collect_evidence(phase)
