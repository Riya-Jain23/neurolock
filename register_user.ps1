$uri = "http://localhost:4311/api/auth/register"
$body = @{
    email = "doctor@neurolock.com"
    password = "SecurePass123!"
    name = "Dr. John Smith"
    role = "psychiatrist"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri $uri -Method Post -Body $body -Headers $headers
    Write-Host "Registration successful!"
    Write-Host $response.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host $_.Exception.Response.Content
    }
}
