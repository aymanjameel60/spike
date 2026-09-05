$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Spike v10.13 - dashboard cleanup / freeze fix" -ForegroundColor Cyan

$remove = @(
  "apps\vendor\src\spike\SidebarBadges.tsx",
  "apps\admin\src\spike\SidebarBadges.tsx",
  "apps\vendor\src\custom-fields\offer.tsx",
  "apps\vendor\src\custom-fields\product.tsx",
  "apps\admin\src\custom-fields\offer.tsx",
  "apps\admin\src\spike\SpikeProductPriceHelper.tsx",
  "apps\admin\src\spike\SpikeLaunchPanel.tsx",
  "apps\vendor\dist",
  "apps\admin\dist",
  "apps\vendor\node_modules\.vite",
  "apps\admin\node_modules\.vite",
  "packages\api\node_modules\@acme\vendor\node_modules\.vite",
  "packages\api\node_modules\@acme\admin\node_modules\.vite"
)
foreach ($rel in $remove) {
  $p = Join-Path $root $rel
  if (Test-Path $p) { Remove-Item $p -Recurse -Force; Write-Host "Removed $rel" }
}
Write-Host "Cleanup complete. Run: bun run build then bun run dev" -ForegroundColor Green
