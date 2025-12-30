// ============================================
// 企业级后台管理系统 - 后端主服务
// 修改版: 启用 AI 路由，适配 DeepSeek
// ============================================

require('dotenv').config(); // 加载环境变量

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
// const redis = require('redis'); // [已移除] 移除 Redis 依赖
const connectDB = require('./config/database');

// 路由导入
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
// const roleRoutes = require('./routes/role');
const orderRoutes = require('./routes/order');
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes = require('./routes/ai'); // [已启用] 恢复 AI 路由

const app = express();

// ============================================
// 中间件配置
// ============================================

// 安全相关
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'], // 明确指定前端地址
  credentials: true
}));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务 - 添加CORS头部
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  }
}));

// MongoDB 注入防护
app.use(mongoSanitize());

// 压缩响应
app.use(compression());

// 日志
app.use(morgan('dev')); // 使用 dev 模式日志更清晰

// 速率限制 (内存模式，不使用 Redis)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 开发模式放宽限制
  message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

// ============================================
// Mock Redis (模拟 Redis 客户端)
// ============================================
const mockRedis = {
  get: async () => null,
  set: async () => {},
  setex: async () => {},
  del: async () => {},
  keys: async () => [],
  on: () => {},
  quit: () => {}
};
app.set('redisClient', mockRedis);

// ============================================
// MongoDB 连接
// ============================================
console.log('🔧 开始连接数据库...');
connectDB();

// ============================================
// 初始化默认数据 (代码省略，保持原样)
// ============================================

// 创建默认超级管理员角色
const initializeDefaultData = async () => {
  // ... (保持原有初始化逻辑不变)
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const Role = require('./models/Role');
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');

    // ... (省略具体的初始化代码，以免篇幅过长，逻辑保持不变)
  } catch (error) {
    console.error('❌ 初始化默认数据失败:', error);
  }
};

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB 连接已建立');
  initializeDefaultData();
});

// ============================================
// API 路由
// ============================================
app.use('/api/auth', authRoutes);
const carousel = require('./routes/carousel');
app.use('/api/carousels', carousel);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes); // [已启用] 挂载 AI 路由

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    mode: 'local-standalone'
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
  // 提供更详细的错误信息
  res.status(err.status || 500).json({ 
    error: err.message || '服务器内部错误',
    stack: err.stack,
    details: {
      name: err.name,
      message: err.message,
      path: req.path,
      method: req.method
    }
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
console.log('🔧 启动服务器，端口:', PORT);
const server = app.listen(PORT, async () => {
  console.log(`
╔═══════════════════════════════════════╗
║     服务器启动成功                       ║
║     端口: ${PORT}                      ║
║     AI服务: DeepSeek (Enabled)         ║
╚═══════════════════════════════════════╝
  `);
  
  // 创建默认管理员用户
  try {
    const Role = require('./models/Role');
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    
    // 等待数据库初始化完成
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 创建超级管理员角色
    let superAdminRole = await Role.findOne({ name: 'super_admin' });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: 'super_admin',
        displayName: '超级管理员',
        level: 100,
        permissions: [
          { resource: 'user', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'product', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'order', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'category', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'carousel', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'ai', actions: ['read'] }
        ]
      });
      console.log('✅ 超级管理员角色创建完成');
    }
    
    // 创建普通用户角色
    let userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      userRole = await Role.create({
        name: 'user',
        displayName: '普通用户',
        level: 10,
        permissions: [
          { resource: 'user', actions: ['read'] },
          { resource: 'product', actions: ['read'] },
          { resource: 'order', actions: ['read'] },
          { resource: 'category', actions: ['read'] }
        ]
      });
      console.log('✅ 普通用户角色创建完成');
    }
    
    // 创建商家角色
    let merchantRole = await Role.findOne({ name: 'merchant' });
    if (!merchantRole) {
      merchantRole = await Role.create({
        name: 'merchant',
        displayName: '商家',
        level: 50,
        permissions: [
          // 商家权限将在审核通过后设置
        ]
      });
      console.log('✅ 商家角色创建完成');
    }
    
    // 创建管理员用户
    let adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      const plainPassword = 'Admin123';
      // 不再预先哈希密码，而是直接使用明文密码创建用户，让 Mongoose 的 pre-save 钩子处理哈希
      adminUser = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: plainPassword,  // 明文密码
        role: superAdminRole._id,
        status: 'active'
      });
      
      // 保存用户（触发保存中间件）
      await adminUser.save();
      console.log('✅ 管理员用户创建完成');
      console.log('📧 登录邮箱: admin@example.com');
      console.log('🔑 登录密码: Admin123');
    } else {
      console.log('Admin user already exists');
    }
    
    // 创建测试商家申请数据
    try {
      const seedMerchantData = require('../scripts/seed-merchants');
      await seedMerchantData();
    } catch (error) {
      console.error('创建测试商家申请数据失败:', error);
    }
  } catch (error) {
    console.error('创建默认用户失败:', error);
  }
});

process.on('SIGTERM', () => {
  mongoose.connection.close();
  server.close(() => {
    process.exit(0);
  });
});

module.exports = app;
