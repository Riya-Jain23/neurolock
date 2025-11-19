# Register psychiatrist account
$registerUri = "http://localhost:4311/api/auth/register"
$registerBody = @{
    email = "doctor@neurolock.com"
    password = "SecurePass123!"
    name = "Dr. John Smith"
    role = "psychiatrist"
} | ConvertTo-Json

$headers = @{ "Content-Type" = "application/json" }

Write-Host "=== REGISTERING ACCOUNT ===" -ForegroundColor Cyan
Write-Host "Email: doctor@neurolock.com"
Write-Host "Name: Dr. John Smith"
Write-Host "Role: psychiatrist`n"

try {
    $registerResponse = Invoke-WebRequest -Uri $registerUri -Method Post -Body $registerBody -Headers $headers
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host $registerResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Registration failed" -ForegroundColor Red
    Write-Host $_.Exception.Response.Content | Out-String
}

# Now test login
Write-Host "`n=== TESTING LOGIN ===" -ForegroundColor Cyan
$loginUri = "http://localhost:4311/api/auth/login"
$loginBody = @{
    email = "doctor@neurolock.com"
    password = "SecurePass123!"
} | ConvertTo-Json

Write-Host "Email: doctor@neurolock.com"
Write-Host "Password: SecurePass123!`n"

try {
    $loginResponse = Invoke-WebRequest -Uri $loginUri -Method Post -Body $loginBody -Headers $headers
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host $loginResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Login failed" -ForegroundColor Red
    Write-Host $_.Exception.Response.Content | Out-String
}
