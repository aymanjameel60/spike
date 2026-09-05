$ErrorActionPreference = "Stop"
Write-Host "Spike v10 - cleaning obsolete v8 custom product routes..." -ForegroundColor Cyan
$obsolete = @(
  "apps\admin\src\routes\add-product",
  "apps\vendor\src\routes\add-product"
)
foreach ($p in $obsolete) {
  if (Test-Path $p) { Remove-Item $p -Recurse -Force; Write-Host "Removed $p" }
}
Write-Host "Cleanup complete. Run:" -ForegroundColor Green
Write-Host "bun run build"
Write-Host "bun run dev"
