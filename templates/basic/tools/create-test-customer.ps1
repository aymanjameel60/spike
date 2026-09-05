param(
  [string]$Api = "http://localhost:9000",
  [Parameter(Mandatory=$true)][string]$PublishableKey,
  [string]$Email = "customer@spike.test",
  [string]$Password = "Spike2026!"
)
$ErrorActionPreference = "Stop"
try {
  $auth = Invoke-RestMethod -Method POST -Uri "$Api/auth/customer/emailpass/register" -ContentType "application/json" -Body (@{email=$Email;password=$Password}|ConvertTo-Json)
  $token = if ($auth.token) {$auth.token} else {$auth.access_token}
  if (-not $token) { throw "No customer token returned" }
  $headers = @{Authorization="Bearer $token";"x-publishable-api-key"=$PublishableKey}
  Invoke-RestMethod -Method POST -Uri "$Api/store/customers" -Headers $headers -ContentType "application/json" -Body (@{email=$Email;first_name="Spike";last_name="Test Customer"}|ConvertTo-Json) | Out-Null
  Write-Host "TEST CUSTOMER READY" -ForegroundColor Green
  Write-Host "Email: $Email"
  Write-Host "Password: $Password"
} catch {
  Write-Host $_.Exception.Message -ForegroundColor Red
  Write-Host "If the email already exists, use the same credentials to log in." -ForegroundColor Yellow
  exit 1
}
