# start.ps1 - Inicia o servidor PHP local para testes
# Requer: PHP 8.x instalado e no PATH
#
# Uso: powershell -ExecutionPolicy Bypass -File start.ps1

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Doce Expresso - Servidor Local" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se PHP está instalado
$phpVersion = php -v 2>$null
if (-not $phpVersion) {
    Write-Host "ERRO: PHP não encontrado no PATH!" -ForegroundColor Red
    Write-Host "Instale o PHP 8.x em: https://windows.php.net/download" -ForegroundColor Yellow
    exit 1
}

Write-Host "PHP detectado:" -ForegroundColor Green
php -v | Select-Object -First 1
Write-Host ""

# Cria diretório data se não existir
$dataDir = Join-Path -Path $PSScriptRoot -ChildPath "data"
if (-not (Test-Path -LiteralPath $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    Write-Host "Diretório 'data' criado." -ForegroundColor Green
}

# Verifica se SQLite3 está disponível no PHP
$sqliteCheck = php -m 2>$null | Select-String -Pattern "sqlite"
if (-not $sqliteCheck) {
    Write-Host "AVISO: Extensão SQLite não encontrada no PHP!" -ForegroundColor Yellow
    Write-Host "Verifique se sqlite3 está habilitado no php.ini" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Iniciando servidor PHP em: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Para acessar o painel admin: http://localhost:8000/admin.html" -ForegroundColor Cyan
Write-Host "Senha padrão: 1234" -ForegroundColor Gray
Write-Host ""
Write-Host "Execute o seed (popula dados iniciais):" -ForegroundColor Yellow
Write-Host "  php seed.php" -ForegroundColor White
Write-Host ""
Write-Host "Pressione CTRL+C para parar o servidor." -ForegroundColor Gray
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Inicia o servidor embutido do PHP
php -S localhost:8000 -t $PSScriptRoot
