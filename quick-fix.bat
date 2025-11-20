@echo off
echo ========================================
echo YouTube Scraper 快速修复脚本
echo ========================================
echo.

echo 步骤1: 停止开发服务器
echo 请在运行 npm run dev 的窗口按 Ctrl+C 停止服务器
echo 按任意键继续...
pause > nul

echo.
echo 步骤2: 拉取最新代码...
git pull origin main

if errorlevel 1 (
    echo.
    echo ❌ Git拉取失败！
    echo 请手动运行: git pull origin main
    pause
    exit /b 1
)

echo.
echo ✅ 代码已更新

echo.
echo 步骤3: 清除Next.js缓存...
if exist .next (
    rmdir /s /q .next
    echo ✅ .next 缓存已清除
) else (
    echo ℹ️  .next 目录不存在，跳过
)

echo.
echo 步骤4: 重新安装依赖（如果需要）...
if exist node_modules (
    echo ℹ️  node_modules 已存在，跳过安装
) else (
    echo 安装依赖...
    call npm install
)

echo.
echo ========================================
echo ✅ 修复完成！
echo ========================================
echo.
echo 下一步操作:
echo 1. 运行: npm run dev
echo 2. 访问: http://localhost:3000
echo 3. 测试YouTube爬取功能
echo.
echo 或者运行检查脚本:
echo    node check-apify-actors.js
echo.
pause
