#!/bin/bash

# YouTube爆款发现功能快速测试脚本

echo "🚀 YouTube爆款发现功能快速测试"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查Node.js
echo "📦 检查环境..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js未安装${NC}"
    echo "请访问 https://nodejs.org 下载安装"
    exit 1
fi
echo -e "${GREEN}✅ Node.js已安装: $(node -v)${NC}"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm未安装${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm已安装: $(npm -v)${NC}"

# 检查.env文件
echo ""
echo "🔑 检查环境变量..."
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env文件不存在${NC}"
    echo "创建.env文件..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  请编辑 .env 文件并填入真实的API密钥${NC}"
    echo ""
    echo "需要的API密钥："
    echo "  1. Supabase (https://supabase.com)"
    echo "  2. Apify (https://apify.com)"
    echo "  3. Google Gemini (https://ai.google.dev)"
    echo ""
    echo "按回车继续（或Ctrl+C退出）..."
    read
else
    echo -e "${GREEN}✅ .env文件存在${NC}"
fi

# 检查node_modules
echo ""
echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  依赖未安装，开始安装...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 依赖安装失败${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
else
    echo -e "${GREEN}✅ 依赖已安装${NC}"
fi

# 运行单元测试
echo ""
echo "🧪 运行单元测试..."
echo "================================"
node test-youtube-discovery.js

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 单元测试失败${NC}"
    exit 1
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ 单元测试通过！${NC}"
echo ""

# 询问是否启动开发服务器
echo "📝 下一步操作："
echo "1. 启动开发服务器（npm run dev）"
echo "2. 查看测试指南（docs/TESTING_GUIDE.md）"
echo "3. 退出"
echo ""
read -p "请选择 (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo "🌐 启动开发服务器..."
        echo "访问 http://localhost:3000/discover 进行测试"
        echo ""
        npm run dev
        ;;
    2)
        echo ""
        echo "📖 打开测试指南..."
        if command -v cat &> /dev/null; then
            cat docs/TESTING_GUIDE.md
        else
            echo "请手动打开 docs/TESTING_GUIDE.md"
        fi
        ;;
    3)
        echo ""
        echo "👋 退出测试"
        exit 0
        ;;
    *)
        echo ""
        echo -e "${YELLOW}无效选择，退出${NC}"
        exit 0
        ;;
esac
