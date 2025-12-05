
部署文档
环境要求

Node.js >= 14.0
MongoDB >= 4.4
Redis >= 6.0
Nginx >= 1.18


生产环境部署
1. 服务器准备
   bash# 更新系统
   sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# 安装 Redis
sudo apt install redis-server -y

# 安装 Nginx
sudo apt install nginx -y

# 安装 PM2
sudo npm install -g pm2
2. 后端部署
   bashcd backend

# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env
nano .env

# 启动服务
pm2 start app.js --name admin-api

# 设置开机自启
pm2 startup
pm2 save
3. 前端部署
   bashcd frontend

# 安装依赖
npm install

# 构建生产版本
npm run build

# 将 dist 目录复制到 Nginx 目录
sudo cp -r dist/* /var/www/html/
4. Nginx 配置
   nginxserver {
   listen 80;
   server_name your-domain.com;

   # 前端静态文件
   location / {
   root /var/www/html;
   index index.html;
   try_files $uri $uri/ /index.html;
   }

   # API 代理
   location /api/ {
   proxy_pass http://localhost:5000/api/;
   proxy_http_version 1.1;
   proxy_set_header Upgrade $http_upgrade;
   proxy_set_header Connection 'upgrade';
   proxy_set_header Host $host;
   proxy_cache_bypass $http_upgrade;
   }
   }
5. SSL 证书配置（Let's Encrypt）
   bashsudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com

Docker 部署
docker-compose.yml
yamlversion: '3.8'

services:
mongodb:
image: mongo:6.0
container_name: admin-mongodb
restart: always
ports:
- "27017:27017"
volumes:
- mongodb_data:/data/db
environment:
MONGO_INITDB_ROOT_USERNAME: admin
MONGO_INITDB_ROOT_PASSWORD: password

redis:
image: redis:7-alpine
container_name: admin-redis
restart: always
ports:
- "6379:6379"

backend:
build: ./backend
container_name: admin-backend
restart: always
ports:
- "5000:5000"
depends_on:
- mongodb
- redis
environment:
- NODE_ENV=production
- MONGODB_URI=mongodb://admin:password@mongodb:27017/admin_system
- REDIS_HOST=redis

frontend:
build: ./frontend
container_name: admin-frontend
restart: always
ports:
- "80:80"
depends_on:
- backend

volumes:
mongodb_data:
启动服务
bashdocker-compose up -d

监控和维护
1. PM2 监控
   bashpm2 monit
   pm2 logs
   pm2 restart all
2. 日志管理
   bash# 查看 Nginx 日志
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log

# 查看应用日志
pm2 logs admin-api
3. 数据库备份
   bash# 备份 MongoDB
   mongodump --uri="mongodb://localhost:27017/admin_system" --out=/backup/mongo/

# 恢复 MongoDB
mongorestore --uri="mongodb://localhost:27017/admin_system" /backup/mongo/
