# Run in PowerShell from this folder:  powershell -ExecutionPolicy Bypass -File .\install.ps1
# Needs: Docker Desktop (running) and Git for Windows (provides Git Bash).
$ErrorActionPreference = 'Stop'
docker --version; git --version
if (-not (Test-Path .\supabase-project)) {
  git clone --depth 1 --filter=blob:none --sparse https://github.com/supabase/supabase.git _src
  Push-Location _src; git sparse-checkout set docker; Pop-Location
  Copy-Item -Recurse .\_src\docker .\supabase-project
  Remove-Item -Recurse -Force .\_src
  Copy-Item .\supabase-project\.env.example .\supabase-project\.env
  $bash = "$env:ProgramFiles\Git\bin\bash.exe"
  Push-Location supabase-project
  & $bash -lc "sh ./utils/generate-keys.sh"
  Pop-Location
}
Push-Location supabase-project
docker compose pull
docker compose up -d
docker compose ps
Pop-Location
Write-Host "Studio: http://localhost:8000  (login credentials are in supabase-project\.env: DASHBOARD_USERNAME / DASHBOARD_PASSWORD)"
