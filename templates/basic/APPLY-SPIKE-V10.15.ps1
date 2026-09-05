$ErrorActionPreference = "Stop"
Write-Host "Applying Spike v10.15 cleanup..." -ForegroundColor Cyan
$remove = @(
 "apps\admin\src\routes\add-product",
 "apps\admin\src\custom-fields\product.tsx",
 "apps\admin\src\widgets\product-list-policy.tsx",
 "apps\admin\src\spike\SpikeProductPriceHelper.tsx",
 "apps\admin\src\spike\SpikeLaunchPanel.tsx"
)
foreach($p in $remove){ if(Test-Path $p){ Remove-Item $p -Recurse -Force } }
Remove-Item "apps\admin\dist","apps\vendor\dist","apps\admin\node_modules\.vite","apps\vendor\node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Done. Now run: cd packages\api; bunx medusa db:migrate; cd ..\..; bun run build" -ForegroundColor Green
