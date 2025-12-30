// 简化的调试服务器
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');

// 从文件中导入模型
const User = require('./backend/models/User');
const Role = require('./backend/models/Role');

const app = express();

// 基本中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 使用内存数据库
async function setupDatabase() {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: true,
  });
  
  console.log('✅ 调试数据库连接成功');
  console.log('📊 URI:', uri);
  
  // 创建默认角色和用户
  await initializeDefaultData();
  
  return mongod;
}

async function initializeDefaultData() {
  // 清空现有数据
  await Promise.all([
    Role.deleteMany({}),
    User.deleteMany({})
  ]).catch(err => console.log('清空数据时出错（可能集合不存在）:', err.message));
  
  // 创建超级管理员角色
  const superAdminRole = await Role.create({
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
  });
  
  console.log('✅ 超级管理员角色创建成功');
  
  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('Admin123', 12);
  await User.create({
    username: 'admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: superAdminRole._id,
    status: 'active'
  });
  
  console.log('✅ 管理员用户创建成功');
  console.log('📧 邮箱: admin@example.com');
  console.log('🔑 密码: Admin123');
}

// 简单的登录路由用于调试
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🎯 收到登录请求:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ 缺少邮箱或密码');
      return res.status(400).json({ error: '邮箱和密码都是必需的' });
    }
    
    console.log('🔍 查找用户:', email);
    const user = await User.findOne({ email }).select('+password').populate('role');
    
    if (!user) {
      console.log('❌ 用户不存在:', email);
      return res.status(401).json({ error: '邮箱或密码错误' });
    }
    
    console.log('🔐 验证密码...');
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      console.log('❌ 密码错误');
      return res.status(401).json({ error: '邮箱或密码错误' });
    }
    
    if (user.status !== 'active') {
      console.log('❌ 账户未激活:', user.status);
      return res.status(403).json({ error: '账户已被停用' });
    }
    
    // 生成模拟token
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'debug-secret-key';
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    // 更新登录信息
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();
    
    console.log('✅ 登录成功:', user.email);
    
    res.json({
      message: '登录成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        permissions: user.role.permissions
      }
    });
  } catch (error) {
    console.error('❌ 登录错误详情:', error);
    res.status(500).json({ 
      error: '登录失败', 
      details: {
        message: error.message,
        stack: error.stack
      }
    });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'debug-server' });
});

// 启动服务器
async function startServer() {
  const mongod = await setupDatabase();
  
  const PORT = 5001;
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 调试服务器启动成功！`);
    console.log(`📊 端口: ${PORT}`);
    console.log(`🔗 登录端点: http://localhost:${PORT}/api/auth/login`);
    console.log(`📋 测试凭据: admin@example.com / Admin123`);
  });
  
  // 错误处理
  server.on('error', (err) => {
    console.error('服务器错误:', err);
  });
}

startServer().catch(err => {
  console.error('启动服务器时出错:', err);
  process.exit(1);
});