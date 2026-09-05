$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Remove-Item -Recurse -Force "$root\apps\admin\src\routes\add-product" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$root\apps\admin\dist" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$root\apps\vendor\dist" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$root\packages\api\.medusa" -ErrorAction SilentlyContinue
Write-Host "Spike v10.17 cleanup applied. Admin add-product removed." -ForegroundColor Green
