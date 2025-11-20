@echo off
chcp 65001 >nul
echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║   YouTube Shorts 优化爬取 - 快速启动                 ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

echo 📌 可用的预设模式:
echo    1. viral      - 🔥 爆款发现 (10万+播放)
echo    2. potential  - 🚀 潜力挖掘 (1万+播放，高互动)
echo    3. blueOcean  - 🌊 蓝海机会 (5K+播放，超高互动)
echo.

echo 📌 可用的内容类别:
echo    1. education       - 📚 教育 (推荐)
echo    2. tech            - 💻 科技
echo    3. business        - 💼 商业
echo    4. lifestyle       - 🏡 生活
echo    5. quickKnowledge  - 💡 快速知识
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 请选择预设模式 (默认: viral):
set /p PRESET="输入 (1-3): "

if "%PRESET%"=="1" set PRESET=viral
if "%PRESET%"=="2" set PRESET=potential
if "%PRESET%"=="3" set PRESET=blueOcean
if "%PRESET%"=="" set PRESET=viral

echo.
echo 请选择内容类别 (默认: education):
set /p CATEGORY="输入 (1-5): "

if "%CATEGORY%"=="1" set CATEGORY=education
if "%CATEGORY%"=="2" set CATEGORY=tech
if "%CATEGORY%"=="3" set CATEGORY=business
if "%CATEGORY%"=="4" set CATEGORY=lifestyle
if "%CATEGORY%"=="5" set CATEGORY=quickKnowledge
if "%CATEGORY%"=="" set CATEGORY=education

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ✅ 配置完成
echo    预设: %PRESET%
echo    类别: %CATEGORY%
echo.
echo 🚀 开始测试...
echo.

node test-shorts-optimizer.js %PRESET% %CATEGORY%

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 测试完成！
echo.
pause
