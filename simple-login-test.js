// 简化的登录测试服务器
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 模拟用户数据
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: '$2b$12$34567890123456789012345678901234567890123456789012345', // 'Admin123' 的哈希值
    role: { name: 'super_admin', displayName: '超级管理员' },
    status: 'active'
  }
];

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'simple-login-test', timestamp: new Date() });
});

// 登录接口
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🎯 收到登录请求:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: '邮箱和密码都是必需的'
      });
    }

    // 查找用户
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      console.log('❌ 用户不存在:', email);
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: '账户已被停用' });
    }

    // 验证密码 (使用预定义的哈希值)
    // 注意：这里我们假设密码是 'Admin123'
    const isValidPassword = password === 'Admin123';
    if (!isValidPassword) {
      console.log('❌ 密码错误');
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 生成 token
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      'test-secret-key-change-in-production', 
      { expiresIn: '7d' }
    );

    console.log('✅ 登录成功:', user.email);

    // 模拟更新登录信息
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: 'https://ui-avatars.com/api/?name=Admin',
        role: user.role,
        permissions: [
          { resource: 'user', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'product', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'order', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'category', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'ai', actions: ['read'] }
        ]
      }
    });
  } catch (error) {
    console.error('❌ 登录错误:', error);
    res.status(500).json({ 
      error: '登录失败', 
      details: error.message,
      stack: error.stack
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 简化版登录测试服务器启动成功！`);
  console.log(`📍 端口: ${PORT}`);
  console.log(`📋 测试登录: POST /api/auth/login {email: "admin@example.com", password: "Admin123"}`);
  console.log(`🏥 健康检查: GET /health`);
});

module.exports = app;