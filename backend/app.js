// ============================================
// 企业级后台管理系统 - 后端主服务
// 技术栈: Express + MongoDB + JWT + Redis
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const morgan = require('morgan');
const redis = require('redis');

// 路由导入
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const roleRoutes = require('./routes/role');
const orderRoutes = require('./routes/order');
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes = require('./routes/ai');

const app = express();

// ============================================
// 中间件配置
// ============================================

// 安全相关
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
app.use(morgan('combined'));

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制100个请求
    message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

// ============================================
// Redis 连接 (缓存 & Session)
// ============================================
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
});

redisClient.on('error', (err) => console.error('Redis错误:', err));
redisClient.on('connect', () => console.log('✓ Redis 连接成功'));

// 将 Redis 客户端挂载到 app
app.set('redisClient', redisClient);

// ============================================
// MongoDB 连接
// ============================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/admin_system', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true
})
    .then(() => console.log('✓ MongoDB 连接成功'))
    .catch(err => {
        console.error('✗ MongoDB 连接失败:', err);
        process.exit(1);
    });

// ============================================
// API 路由
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime()
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
        error: err.message || '服务器内部错误',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
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
║   🚀 服务器启动成功                    ║
║   📡 端口: ${PORT}                     ║
║   🌍 环境: ${process.env.NODE_ENV || 'development'}        ║
║   📅 时间: ${new Date().toLocaleString('zh-CN')}   ║
╚═══════════════════════════════════════╝
  `);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在优雅关闭...');
    mongoose.connection.close();
    redisClient.quit();
    process.exit(0);
});

module.exports = app;