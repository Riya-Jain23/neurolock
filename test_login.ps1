Write-Host "`n=== NeuroLock Login Troubleshooting ===" -ForegroundColor Cyan

# Check services
Write-Host "`nStep 1: Checking Services..." -ForegroundColor Yellow

$mysql = Test-NetConnection -ComputerName 127.0.0.1 -Port 3307 -WarningAction SilentlyContinue
Write-Host ("MySQL (3307): " + (if ($mysql.TcpTestSucceeded) { "OK" } else { "FAILED" }))

$backend = Test-NetConnection -ComputerName localhost -Port 4311 -WarningAction SilentlyContinue
Write-Host ("Backend API (4311): " + (if ($backend.TcpTestSucceeded) { "OK" } else { "FAILED" }))

if ($backend.TcpTestSucceeded -eq $false) {
    Write-Host "`nERROR: Backend is not running!" -ForegroundColor Red
    Write-Host "Start it with:" -ForegroundColor Yellow
    Write-Host "  cd C:\Users\shubh\projects\neurolock\neurolock-staff-backend" -ForegroundColor Gray
    Write-Host "  npm run dev" -ForegroundColor Gray
    Write-Host ""
    exit
}

# Test API
Write-Host "`nStep 2: Testing Login..." -ForegroundColor Yellow

$loginBody = @{
    email = "doctor@neurolock.com"
    password = "SecurePass123!"
} | ConvertTo-Json

$headers = @{ "Content-Type" = "application/json" }

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4311/api/auth/login" -Method Post -Body $loginBody -Headers $headers -ErrorAction Stop
    Write-Host "SUCCESS! User logged in." -ForegroundColor Green
} catch {
    $err = $_.Exception.Response | Out-String
    Write-Host "FAILED - Error details:" -ForegroundColor Red
    Write-Host $err
    
    # Try to parse error
    try {
        $errorBody = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()).ReadToEnd() | ConvertFrom-Json
        Write-Host "`nError Message: $($errorBody.error.message)" -ForegroundColor Yellow
        
        if ($errorBody.error.message -eq "Invalid credentials") {
            Write-Host "`nUser account does not exist or password is wrong." -ForegroundColor Yellow
            Write-Host "Register account with:" -ForegroundColor Yellow
            Write-Host "  powershell -ExecutionPolicy Bypass -File setup_test_account.ps1" -ForegroundColor Gray
        }
    } catch {
        Write-Host $_.Exception.Message
    }
}

Write-Host "`n=== Solutions ===" -ForegroundColor Cyan
Write-Host "1. If backend not running:" -ForegroundColor Yellow
Write-Host "   cd C:\Users\shubh\projects\neurolock\neurolock-staff-backend && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. If credentials invalid:" -ForegroundColor Yellow  
Write-Host "   powershell -ExecutionPolicy Bypass -File setup_test_account.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "3. View database:" -ForegroundColor Yellow
Write-Host "   http://localhost:8080 (user: app, pass: NeuroLock@2025)" -ForegroundColor Gray
Write-Host ""
