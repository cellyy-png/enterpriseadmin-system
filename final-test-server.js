// 最终测试服务器 - 使用错误处理和详细日志
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();

// 增强中间件
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 添加请求日志
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// 模拟用户数据
const mockUsers = [
  {
    _id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: '$2b$12$34567890123456789012345678901234567890123456789012345', // 'Admin123' 的哈希值
    role: { 
      _id: 'role1', 
      name: 'super_admin', 
      displayName: '超级管理员',
      permissions: [
        { resource: 'user', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'product', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'order', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'category', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'ai', actions: ['read'] }
      ]
    },
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Admin'
  }
];

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'final-test-server', 
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// 登录接口 - 带有详细错误处理
app.post('/api/auth/login', async (req, res) => {
  console.log('🎯 收到登录请求');
  
  try {
    const { email, password } = req.body;
    
    console.log(`🔍 尝试登录用户: ${email}`);
    
    if (!email || !password) {
      console.log('❌ 缺少必要字段');
      return res.status(400).json({ 
        error: '邮箱和密码都是必需的',
        details: {
          hasEmail: !!email,
          hasPassword: !!password
        }
      });
    }

    // 查找用户
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      console.log('❌ 用户不存在:', email);
      return res.status(401).json({ 
        error: '邮箱或密码错误',
        details: { email }
      });
    }

    console.log('👤 找到用户，验证密码...');

    if (user.status !== 'active') {
      console.log('❌ 账户状态不允许登录:', user.status);
      return res.status(403).json({ 
        error: '账户已被停用',
        details: { status: user.status }
      });
    }

    // 验证密码 (使用明文比较)
    const isValidPassword = password === 'Admin123';
    if (!isValidPassword) {
      console.log('❌ 密码错误');
      return res.status(401).json({ 
        error: '邮箱或密码错误',
        details: { email, validPassword: false }
      });
    }

    console.log('🔐 密码验证成功');

    // 生成 token
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET || 'debug-secret-key-change-in-production', 
      { expiresIn: '7d' }
    );

    console.log('✅ 登录成功，生成token');

    // 模拟更新登录信息
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;

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
    console.error('❌ 登录过程发生错误:', error);
    console.error('错误堆栈:', error.stack);
    
    res.status(500).json({ 
      error: '登录失败', 
      details: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method
    });
  }
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('全局错误捕获:', err);
  res.status(500).json({ 
    error: '服务器内部错误',
    details: err.message,
    stack: err.stack
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ 
    error: '请求的资源不存在',
    path: req.path,
    method: req.method
  });
});

const PORT = process.env.PORT || 5001; // 使用 5001 端口避免冲突
app.listen(PORT, () => {
  console.log(`\n🚀 最终测试服务器启动成功！`);
  console.log(`📍 监听端口: ${PORT}`);
  console.log(`📋 测试登录: POST /api/auth/login {email: "admin@example.com", password: "Admin123"}`);
  console.log(`🏥 健康检查: GET /health`);
  console.log(`💡 服务器已准备就绪\n`);
});

module.exports = app;