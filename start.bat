@echo off
REM NeuroLock Quick Start Script for Windows
REM This script starts all necessary services for development

echo.
echo NeuroLock Quick Start
echo =====================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

echo Choose what you want to start:
echo 1) Full Stack (Database + Backend + Frontend)
echo 2) Database Only
echo 3) Backend Only
echo 4) Frontend Only
echo 5) Backend + Frontend (Database must be running)
echo.
set /p choice="Enter choice [1-5]: "

if "%choice%"=="1" (
    call :start_database
    if errorlevel 1 exit /b 1
    call :start_backend
    if errorlevel 1 exit /b 1
    call :start_frontend
) else if "%choice%"=="2" (
    call :start_database
) else if "%choice%"=="3" (
    call :start_backend
) else if "%choice%"=="4" (
    call :start_frontend
) else if "%choice%"=="5" (
    call :start_backend
    if errorlevel 1 exit /b 1
    call :start_frontend
) else (
    echo Invalid choice
    exit /b 1
)

exit /b 0

:start_database
    echo.
    echo Starting MySQL Database...
    cd backend\sql-dbms-bundle\sql-dbms
    docker compose up -d
    
    timeout /t 5 /nobreak
    
    docker compose ps | findstr "healthy" >nul
    if %errorlevel% equ 0 (
        echo ✓ MySQL Database started successfully
        cd ..\..\..\
        exit /b 0
    ) else (
        echo Error: MySQL Database failed to start
        cd ..\..\..\
        exit /b 1
    )

:start_backend
    echo.
    echo Starting Backend Server...
    cd neurolock-staff-backend
    
    if not exist "node_modules" (
        echo Installing dependencies...
        call npm install
    )
    
    start cmd /k npm run dev
    echo ✓ Backend server started
    cd ..
    
    timeout /t 3 /nobreak
    exit /b 0

:start_frontend
    echo.
    echo Starting Frontend...
    echo.
    echo Update your local IP in frontend\.env
    echo Find your IP with: ipconfig
    echo.
    
    cd frontend
    
    if not exist "node_modules" (
        echo Installing dependencies...
        call npm install
    )
    
    echo Starting Expo...
    call npm start
