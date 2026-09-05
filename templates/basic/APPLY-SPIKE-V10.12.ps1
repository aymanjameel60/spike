$ErrorActionPreference = "Stop"
Write-Host "Spike v10.12 source cleanup" -ForegroundColor Cyan
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
# Obsolete custom routes that must not remain after overlaying older Spike patches.
$obsolete = @(
  "apps\admin\src\routes\add-product\page.tsx",
  "packages\api\src\api\store\spike\checkout\shipping\route.ts"
)
foreach ($rel in $obsolete) {
  $target = Join-Path $root $rel
  if (Test-Path $target) { Remove-Item $target -Force; Write-Host "Removed $rel" }
}
Write-Host "Cleanup complete. Preserve your existing packages\api\.env." -ForegroundColor Green
Write-Host "Next: bun install (if needed), cd packages\api; bunx medusa db:migrate; cd ..\..; bun run build; bun run dev"
