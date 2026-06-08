@echo off
chcp 65001 >nul
echo ================================
echo   集市管理系统 - 启动中...
echo ================================
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo 正在安装依赖...
    call npm install
    echo.
)

echo 正在启动Vite开发服务器...
start "Vite Dev Server" cmd /c "npx vite --port 5173"

timeout /t 3 /nobreak >nul

echo 正在打开应用...
start http://localhost:5173/stalls

echo.
echo ================================
echo   集市管理系统已启动！
echo   请勿关闭Vite开发服务器窗口
echo   关闭服务器即退出应用
echo ================================
echo.
pause
