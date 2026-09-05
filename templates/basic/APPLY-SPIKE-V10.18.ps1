$ErrorActionPreference = "Stop"
Write-Host "Applying Spike v10.18 architecture cleanup..." -ForegroundColor Cyan
$remove = @(
  "apps/admin/src/routes/add-product",
  "packages/api/src/api/vendor/spike/orders/[id]/receipt",
  "apps/admin/src/spike/SpikeLaunchPanel.tsx",
  "apps/admin/src/spike/SpikeProductPriceHelper.tsx"
)
foreach($p in $remove){ if(Test-Path $p){ Remove-Item $p -Recurse -Force } }
if(Test-Path ".turbo"){ Remove-Item ".turbo" -Recurse -Force }
if(Test-Path "apps/admin/dist"){ Remove-Item "apps/admin/dist" -Recurse -Force }
if(Test-Path "apps/vendor/dist"){ Remove-Item "apps/vendor/dist" -Recurse -Force }
Write-Host "Done. Run: cd packages/api; bunx medusa db:migrate; cd ../..; bun run dev" -ForegroundColor Green
