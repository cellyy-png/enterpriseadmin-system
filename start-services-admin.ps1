# 请求管理员权限
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "请求管理员权限..." -ForegroundColor Yellow
    $arguments = "& '" + $myinvocation.mycommand.definition + "'"
    Start-Process powershell -ArgumentList $arguments -Verb RunAs
    Break
}

Write-Host "企业管理系统服务启动脚本" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# 终止现有 Node 进程
Write-Host "🔧 终止现有 Node 进程..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Start-Sleep -Seconds 2

# 检查端口占用
Write-Host "🔍 检查端口占用情况..." -ForegroundColor Yellow
$ports = 3000, 5000
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "⚠️  端口 $port 被进程 $($process.OwningProcess) 占用" -ForegroundColor Red
        Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "✅ 已终止占用进程" -ForegroundColor Green
    } else {
        Write-Host "✅ 端口 $port 可用" -ForegroundColor Green
    }
}

# 启动后端服务
Write-Host "🚀 启动后端服务..." -ForegroundColor Yellow
Set-Location "E:\develop\code\enterpriseadminsystem\backend"
$backend = Start-Process -FilePath "node" -ArgumentList "app.js" -PassThru
Write-Host "✅ 后端服务已启动，进程ID: $($backend.Id)" -ForegroundColor Green

# 等待后端启动
Write-Host "⏳ 等待后端服务启动 (10秒)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 启动前端服务
Write-Host "🌐 启动前端服务..." -ForegroundColor Yellow
Set-Location "E:\develop\code\enterpriseadminsystem\frontend"
$frontend = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru
Write-Host "✅ 前端服务已启动，进程ID: $($frontend.Id)" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 服务启动完成！" -ForegroundColor Green
Write-Host "💻 前端: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🛠️  后端: http://localhost:5000" -ForegroundColor Cyan
Write-Host "🔑 登录: admin@example.com / Admin123" -ForegroundColor Cyan

Write-Host ""
Write-Host "要停止服务，请运行: taskkill /pid $($backend.Id), $($frontend.Id) /f" -ForegroundColor Yellow