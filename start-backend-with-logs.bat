@echo off
echo 启动后端服务并记录日志...
cd /d "E:\develop\code\enterpriseadminsystem\backend"

REM 清理之前的日志
if exist backend-error.log del backend-error.log
if exist backend-output.log del backend-output.log

REM 启动后端服务并记录输出和错误
echo 启动时间: %date% %time% > backend-output.log
node app.js >> backend-output.log 2>> backend-error.log

echo.
echo 检查错误日志...
if exist backend-error.log (
    echo 错误日志内容:
    type backend-error.log
) else (
    echo 未发现错误
)

echo.
echo 检查输出日志...
type backend-output.log

echo.
echo 按任意键继续...
pause >nul