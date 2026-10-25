"""
ShipSafe - Unified Application Launcher
Starts both the FastAPI backend and Vite React frontend in parallel.
"""
import sys
import os
import subprocess
import time
import socket

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex((host, port)) == 0

def kill_process_on_port(port: int):
    if os.name == "nt":
        try:
            cmd = f'powershell -Command "Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object {{ Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }}"'
            subprocess.run(cmd, shell=True, capture_output=True)
        except Exception:
            pass

def print_banner():
    banner = r"""
========================================================================
   ____ _     _       ____        __      
  / ___| |__ (_)_ __ / ___|  __ _|  ___   
  \___ \| '_ \| | '_ \___ \ / _` | |_    
   ___) | | | | | |_) |___) | (_| |  _|   
  |____/|_| |_|_| .__/|____/ \__,_|_|     
                |_|                       
  AI Code Review for Production Readiness
  From AI-generated code to code you can confidently ship.
========================================================================
    """
    print(banner)

def main():
    print_banner()

    # Free up ports if lingering from previous run
    if is_port_in_use(8000):
        print("[*] Port 8000 is occupied. Clearing existing process...")
        kill_process_on_port(8000)
        time.sleep(1)

    if is_port_in_use(5173):
        print("[*] Port 5173 is occupied. Clearing existing process...")
        kill_process_on_port(5173)
        time.sleep(1)

    print("[*] Starting FastAPI Backend on http://127.0.0.1:8000...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=BACKEND_DIR)

    time.sleep(1.5)

    print("[*] Starting Vite React Frontend on http://127.0.0.1:5173...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen([npm_cmd, "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"], cwd=FRONTEND_DIR)

    print("\n[+] ShipSafe is LIVE!")
    print("    - Web App:   http://127.0.0.1:5173")
    print("    - API Docs:  http://127.0.0.1:8000/docs")
    print("    - Press Ctrl+C to terminate both servers.\n")

    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None or frontend_proc.poll() is not None:
                break
    except KeyboardInterrupt:
        print("\n[*] Shutting down ShipSafe...")
    finally:
        try:
            backend_proc.terminate()
            frontend_proc.terminate()
        except Exception:
            pass
        print("[*] All servers stopped.")

if __name__ == "__main__":
    main()
