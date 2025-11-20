Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   NeuroLock Login Troubleshooting     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Step 1: Check services
Write-Host "STEP 1: Checking Services..." -ForegroundColor Yellow

Write-Host "MySQL (port 3307):" -NoNewline
$mysql = Test-NetConnection -ComputerName 127.0.0.1 -Port 3307 -WarningAction SilentlyContinue
Write-Host " $(if ($mysql.TcpTestSucceeded) { '✅ RUNNING' } else { '❌ STOPPED' })" -ForegroundColor $(if ($mysql.TcpTestSucceeded) { 'Green' } else { 'Red' })

Write-Host "Backend API (port 4311):" -NoNewline
$backend = Test-NetConnection -ComputerName localhost -Port 4311 -WarningAction SilentlyContinue
Write-Host " $(if ($backend.TcpTestSucceeded) { '✅ RUNNING' } else { '❌ STOPPED' })" -ForegroundColor $(if ($backend.TcpTestSucceeded) { 'Green' } else { 'Red' })

Write-Host "Adminer (port 8080):" -NoNewline
$adminer = Test-NetConnection -ComputerName localhost -Port 8080 -WarningAction SilentlyContinue
Write-Host " $(if ($adminer.TcpTestSucceeded) { '✅ RUNNING' } else { '❌ STOPPED' })" -ForegroundColor $(if ($adminer.TcpTestSucceeded) { 'Green' } else { 'Red' })

if ($backend.TcpTestSucceeded -eq $false) {
    Write-Host "`n⚠️  Backend API is NOT running!" -ForegroundColor Red
    Write-Host "`nTo fix, restart the backend:" -ForegroundColor Yellow
    Write-Host "  cd C:\Users\shubh\projects\neurolock\neurolock-staff-backend" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    exit
}

# Step 2: Test API health
Write-Host "`nSTEP 2: Testing API Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:4311/api/auth/health" -Method Get -TimeoutSec 5
    Write-Host "✅ API is healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ API health check failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit
}

# Step 3: Check if user exists in database
Write-Host "`nSTEP 3: Checking Database for User..." -ForegroundColor Yellow
Write-Host "User: doctor@neurolock.com"

# We'll try to login and see what error we get
$loginBody = @{
    email = "doctor@neurolock.com"
    password = "SecurePass123!"
} | ConvertTo-Json

$headers = @{ "Content-Type" = "application/json" }

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:4311/api/auth/login" `
        -Method Post -Body $loginBody -Headers $headers
    Write-Host "✅ Login successful!" -ForegroundColor Green
    $loginData = $loginResponse.Content | ConvertFrom-Json
    Write-Host "Token: $($loginData.data.token.Substring(0,50))..." -ForegroundColor Green
} catch {
    $errorResponse = $_.Exception.Response.Content | Out-String | ConvertFrom-Json
    Write-Host "❌ Login failed" -ForegroundColor Red
    Write-Host "Error: $($errorResponse.error.message)" -ForegroundColor Red
    
    if ($errorResponse.error.message -eq "Invalid credentials") {
        Write-Host "`n💡 DIAGNOSIS: User account may not exist or password is incorrect" -ForegroundColor Yellow
        Write-Host "`nSOLUTION: Register the account first:" -ForegroundColor Yellow
        Write-Host "  Run: powershell -ExecutionPolicy Bypass -File setup_test_account.ps1" -ForegroundColor White
    }
}

# Step 4: Provide solutions
Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Quick Solutions                     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "1️⃣  If Backend is NOT running:" -ForegroundColor Yellow
Write-Host "   cd C:\Users\shubh\projects\neurolock\neurolock-staff-backend" -ForegroundColor Gray
Write-Host "   npm run dev`n" -ForegroundColor Gray

Write-Host "2️⃣  If Login still fails:" -ForegroundColor Yellow
Write-Host "   powershell -ExecutionPolicy Bypass -File setup_test_account.ps1`n" -ForegroundColor Gray

Write-Host "3️⃣  To check/view database users:" -ForegroundColor Yellow
Write-Host "   Open http://localhost:8080" -ForegroundColor Gray
Write-Host "   User: app / Password: NeuroLock@2025`n" -ForegroundColor Gray

Write-Host "4️⃣  To verify user in database:" -ForegroundColor Yellow
Write-Host "   In Adminer, go to users table and check for doctor@neurolock.com" -ForegroundColor Gray
