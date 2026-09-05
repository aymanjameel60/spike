$ErrorActionPreference = "Stop"
$root = Get-Location
$vendorOld = Join-Path $root "apps\vendor\src\routes\add-product"
$adminOld  = Join-Path $root "apps\admin\src\routes\add-product"
if (Test-Path $vendorOld) { Remove-Item $vendorOld -Recurse -Force }
if (Test-Path $adminOld)  { Remove-Item $adminOld -Recurse -Force }
Write-Host "Spike v9: removed old v8/v8.1 duplicate add-product routes." -ForegroundColor Green
Write-Host "Now run: bun run build" -ForegroundColor Cyan
