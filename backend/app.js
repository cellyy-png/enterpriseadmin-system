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
