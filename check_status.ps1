Write-Host "=== NeuroLock Services Status ===" -ForegroundColor Cyan

# Test MySQL
Write-Host "`n1. MySQL Database (port 3307):" -ForegroundColor Yellow
$mysql = Test-NetConnection -ComputerName 127.0.0.1 -Port 3307 -WarningAction SilentlyContinue
if ($mysql.TcpTestSucceeded) { Write-Host "   ✅ RUNNING" -ForegroundColor Green } else { Write-Host "   ❌ CLOSED" -ForegroundColor Red }

# Test Adminer
Write-Host "`n2. Adminer UI (port 8080):" -ForegroundColor Yellow
$adminer = Test-NetConnection -ComputerName 127.0.0.1 -Port 8080 -WarningAction SilentlyContinue
if ($adminer.TcpTestSucceeded) { Write-Host "   ✅ RUNNING" -ForegroundColor Green } else { Write-Host "   ❌ CLOSED" -ForegroundColor Red }

# Test Backend API
Write-Host "`n3. Backend API (port 4311):" -ForegroundColor Yellow
$backend = Test-NetConnection -ComputerName 127.0.0.1 -Port 4311 -WarningAction SilentlyContinue
if ($backend.TcpTestSucceeded) { Write-Host "   ✅ RUNNING" -ForegroundColor Green } else { Write-Host "   ❌ CLOSED" -ForegroundColor Red }

# Test Frontend
Write-Host "`n4. Frontend Expo (port 8081):" -ForegroundColor Yellow
$frontend = Test-NetConnection -ComputerName 127.0.0.1 -Port 8081 -WarningAction SilentlyContinue
if ($frontend.TcpTestSucceeded) { Write-Host "   ✅ RUNNING" -ForegroundColor Green } else { Write-Host "   ❌ CLOSED" -ForegroundColor Red }

# Check Node processes
Write-Host "`n5. Node.js Processes:" -ForegroundColor Yellow
$nodeCount = (Get-Process node -ErrorAction SilentlyContinue | Measure-Object).Count
Write-Host "   Found: $nodeCount Node processes" -ForegroundColor Green

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
$running = @($mysql, $adminer, $backend, $frontend) | Where-Object { $_.TcpTestSucceeded } | Measure-Object
Write-Host "Services running: $($running.Count)/4" -ForegroundColor Green

Write-Host "`n=== Access URLs ===" -ForegroundColor Cyan
Write-Host "Database (Adminer):  http://localhost:8080" -ForegroundColor Magenta
Write-Host "Backend API:         http://localhost:4311/api" -ForegroundColor Magenta
Write-Host "Frontend (Expo):     http://localhost:19000 or scan QR code" -ForegroundColor Magenta
