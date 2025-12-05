#!/bin/bash

echo "========================================="
echo "开始部署企业管理系统"
echo "========================================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js 未安装${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js 已安装${NC}"

# 检查 MongoDB
if ! command -v mongod &> /dev/null; then
    echo -e "${RED}✗ MongoDB 未安装${NC}"
    exit 1
fi
echo -e "${GREEN}✓ MongoDB 已安装${NC}"

# 安装后端依赖
echo -e "\n${GREEN}正在安装后端依赖...${NC}"
cd backend
npm install --production
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 后端依赖安装失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 后端依赖安装成功${NC}"

# 构建前端
echo -e "\n${GREEN}正在构建前端...${NC}"
cd ../frontend
npm install
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 前端构建失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 前端构建成功${NC}"

# 启动后端服务
echo -e "\n${GREEN}正在启动后端服务...${NC}"
cd ../backend
pm2 delete admin-api 2>/dev/null
pm2 start app.js --name admin-api
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 后端服务启动失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 后端服务启动成功${NC}"

# 复制前端文件到 Nginx
echo -e "\n${GREEN}正在部署前端文件...${NC}"
sudo cp -r ../frontend/dist/* /var/www/html/
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 前端文件部署失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 前端文件部署成功${NC}"

# 重启 Nginx
echo -e "\n${GREEN}正在重启 Nginx...${NC}"
sudo systemctl restart nginx
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Nginx 重启失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Nginx 重启成功${NC}"

echo -e "\n========================================="
echo -e "${GREEN}✅ 部署完成！${NC}"
echo "========================================="
echo "访问地址: http://your-domain.com"
echo "API地址: http://your-domain.com/api"
echo ""
echo "PM2 管理命令:"
echo "  查看日志: pm2 logs admin-api"
echo "  重启服务: pm2 restart admin-api"
echo "  停止服务: pm2 stop admin-api"
echo "========================================="
