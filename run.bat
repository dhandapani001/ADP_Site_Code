@echo off
title ADP Tech Computers - Kanchipuram
echo ======================================================================
echo   Launching ADP Tech Computers - Kanchipuram
echo   Address: 33b, Thirumetrali Street, Pillaiyar Palayam, Kanchipuram
echo   Contact: 7806888984
echo ======================================================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10+ from python.org
    pause
    exit /b 1
)

echo [1/2] Checking Python dependencies...
python -m pip install -r requirements.txt --quiet

echo [2/2] Starting ADP Tech Computers Web & API Server on http://127.0.0.1:5000 ...
echo [INFO] Website:        http://127.0.0.1:5000
echo [INFO] Admin Portal:   http://127.0.0.1:5000/admin
echo.

start http://127.0.0.1:5000

python app.py
pause
