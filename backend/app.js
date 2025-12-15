// ============================================
// 企业级后台管理系统 - 后端主服务
// 修改版: 移除 Redis/AI 依赖，使用本地文件数据库
// ============================================

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
// const aiRoutes = require('./routes/ai'); // [已移除] 移除 AI 路由

const app = express();

// ============================================
// 中间件配置
// ============================================

// 安全相关
app.use(helmet());
app.use(cors({
  origin: true, // 允许所有来源，方便开发调试
  credentials: true
}));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

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
// 目的：防止 routes/middleware 中调用 req.app.get('redisClient') 时报错
// ============================================
const mockRedis = {
  get: async () => null,      // 永远返回空，表示没有缓存
  set: async () => {},        // 不做任何事
  setex: async () => {},      // 不做任何事
  del: async () => {},        // 不做任何事
  keys: async () => [],       // 返回空数组
  on: () => {},               // 忽略事件监听
  quit: () => {}              // 忽略退出
};
// 挂载假的 Redis 客户端
app.set('redisClient', mockRedis);
console.log('⚠️  Redis 已禁用，系统将以无缓存模式运行');

// ============================================
// MongoDB 连接
// ============================================
connectDB();

// ============================================
// 初始化默认数据
// ============================================
const initializeDefaultData = async () => {
  try {
    // 延迟一点时间确保数据库连接稳定
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const Role = require('./models/Role');
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');

    console.log('🔧 开始初始化默认数据...');
    
    // 直接创建角色，不管是否存在
    console.log('🔧 创建/更新角色...');
    const rolesData = [
      {
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
      },
      {
        name: 'user',
        displayName: '普通用户',
        level: 10,
        permissions: [{ resource: 'product', actions: ['read'] }]
      }
    ];

    // 删除所有现有角色并重新创建
    await Role.deleteMany({});
    const createdRoles = await Role.insertMany(rolesData);
    const superAdminRole = createdRoles.find(r => r.name === 'super_admin');
    console.log('✅ 角色创建完成');

    // 创建/更新管理员用户
    console.log('🔧 创建/更新管理员用户...');
    const plainPassword = 'Admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    
    // 删除现有的管理员用户并创建新的
    await User.deleteMany({ email: 'admin@example.com' });
    
    // 使用 mongoose 直接创建用户，确保触发 pre-save 钩子
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: plainPassword, // 使用明文密码，让 pre-save 钩子处理加密
      role: superAdminRole._id,
      status: 'active'
    });
    
    // 保存用户，触发密码加密
    await adminUser.save();
    
    console.log('✅ 管理员用户创建完成');
    console.log('   邮箱: admin@example.com');
    console.log('   密码: Admin123');
    
    // 验证创建的用户
    const verifyUser = await User.findById(adminUser._id)
      .select('+password')
      .populate('role');
    
    if (verifyUser) {
      const isPasswordValid = await verifyUser.comparePassword(plainPassword);
      console.log('🔐 密码验证:', isPasswordValid ? '通过' : '失败');
      console.log('   用户名:', verifyUser.username);
      console.log('   邮箱:', verifyUser.email);
      console.log('   角色:', verifyUser.role?.name);
      
      if (!isPasswordValid) {
        // 如果验证失败，手动更新密码
        console.log('🔄 手动更新密码...');
        verifyUser.password = plainPassword;
        await verifyUser.save();
        
        // 再次验证
        const recheckedUser = await User.findById(adminUser._id)
          .select('+password')
          .populate('role');
        const recheckPasswordValid = await recheckedUser.comparePassword(plainPassword);
        console.log('🔐 重新验证密码:', recheckPasswordValid ? '通过' : '失败');
      }
    }
  } catch (error) {
    console.error('❌ 初始化默认数据失败:', error);
  }
};

// 在数据库连接成功后初始化数据
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB 连接已建立');
  initializeDefaultData();
});

// ============================================
// API 路由
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/ai', aiRoutes); // [已禁用]

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    mode: 'local-standalone'
  });
});

// ============================================
// 全局错误处理
// ============================================
app.use((err, req, res, next) => {
  console.error('全局错误:', err);

  // MongoDB 错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: '数据验证失败',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: '无效的ID格式' });
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: '无效的token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token已过期' });
  }

  // 默认错误
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误'
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '请求的资源不存在' });
});

// ============================================
// 服务启动
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║     服务器启动成功                       ║
║     端口: ${PORT}                      ║
║     数据库: 本地文件存储 (No Service)     ║
╚═══════════════════════════════════════╝
  `);
});

// 优雅关闭
process.on('SIGTERM', () => {
  mongoose.connection.close();
  process.exit(0);
});

module.exports = app;