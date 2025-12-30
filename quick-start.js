const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const bcrypt = require('bcryptjs');

// 导入模型
const User = require('./backend/models/User');
const Role = require('./backend/models/Role');

// 导入路由
const authRoutes = require('./backend/routes/auth');
const userRoutes = require('./backend/routes/user');
const orderRoutes = require('./backend/routes/order');
const productRoutes = require('./backend/routes/product');
const categoryRoutes = require('./backend/routes/category');
const dashboardRoutes = require('./backend/routes/dashboard');
const aiRoutes = require('./backend/routes/ai');
const carousel = require('./backend/routes/carousel');

// 创建 Express 应用
const app = express();

// 中间件配置
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'backend/public/uploads')));

app.use(mongoSanitize());
app.use(compression());
app.use(morgan('dev'));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

// 使用内存数据库
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongod;

async function setupDatabase() {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    
    console.log('✅ 内存数据库连接成功');
    console.log('📊 数据库URI:', uri);
    
    // 创建默认角色和用户
    await initializeDefaultData();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
}

async function initializeDefaultData() {
  try {
    // 创建默认角色
    const roleNames = ['super_admin', 'admin', 'user', 'merchant'];
    for (const roleName of roleNames) {
      const existingRole = await Role.findOne({ name: roleName });
      if (!existingRole) {
        let roleData;
        switch (roleName) {
          case 'super_admin':
            roleData = {
              name: 'super_admin',
              displayName: '超级管理员',
              level: 100,
              permissions: [
                { resource: 'user', actions: ['create', 'read', 'update', 'delete'] },
                { resource: 'product', actions: ['create', 'read', 'update', 'delete'] },
                { resource: 'order', actions: ['create', 'read', 'update', 'delete'] },
                { resource: 'category', actions: ['create', 'read', 'update', 'delete'] },
                { resource: 'ai', actions: ['read'] }
              ]
            };
            break;
          case 'admin':
            roleData = {
              name: 'admin',
              displayName: '管理员',
              level: 80,
              permissions: [
                { resource: 'user', actions: ['read', 'update'] },
                { resource: 'product', actions: ['create', 'read', 'update', 'delete'] },
                { resource: 'order', actions: ['read', 'update'] },
                { resource: 'category', actions: ['read'] }
              ]
            };
            break;
          case 'user':
            roleData = {
              name: 'user',
              displayName: '普通用户',
              level: 10,
              permissions: [{ resource: 'product', actions: ['read'] }]
            };
            break;
          case 'merchant':
            roleData = {
              name: 'merchant',
              displayName: '商家',
              level: 20,
              permissions: [
                { resource: 'product', actions: ['create', 'read', 'update', 'delete'] },
                { resource: 'order', actions: ['read', 'update'] }
              ]
            };
            break;
        }
        
        await Role.create(roleData);
        console.log(`✅ ${roleData.displayName} 角色创建成功`);
      }
    }

    // 创建管理员用户
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      const superAdminRole = await Role.findOne({ name: 'super_admin' });
      const hashedPassword = await bcrypt.hash('Admin123', 12);
      
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword, // 存储已哈希的密码
        role: superAdminRole._id,
        status: 'active'
      });
      
      console.log('✅ 管理员用户创建成功');
      console.log('📧 邮箱: admin@example.com');
      console.log('🔑 密码: Admin123');
    } else {
      console.log('✅ 管理员用户已存在');
    }
  } catch (error) {
    console.error('❌ 初始化默认数据失败:', error);
  }
}

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/carousels', carousel);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    mode: 'memory-db'
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('全局错误捕获:', err);
  console.error('错误类型:', err.constructor.name);
  console.error('错误消息:', err.message);
  console.error('错误堆栈:', err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: '数据验证失败', details: Object.values(err.errors).map(e => e.message) });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: '无效的ID格式' });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: '无效的token' });
  }
  
  res.status(err.status || 500).json({ 
    error: err.message || '服务器内部错误',
    details: err.stack
  });
});

// 捕获未处理的异步错误
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
});

app.use((req, res) => {
  res.status(404).json({ error: '请求的资源不存在' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await setupDatabase();
  
  const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║     服务器启动成功                       ║
║     端口: ${PORT}                      ║
║     数据库: 内存数据库                   ║
║     管理员: admin@example.com          ║
║     密码: Admin123                     ║
╚═══════════════════════════════════════╝
    `);
  });

  // 优雅关闭
  process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在关闭服务器...');
    server.close(async () => {
      console.log('服务器已关闭');
      if (mongod) {
        await mongod.stop();
        console.log('内存数据库已关闭');
      }
      process.exit(0);
    });
  });
}

startServer().catch(console.error);