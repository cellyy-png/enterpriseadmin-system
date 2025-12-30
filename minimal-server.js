// 最简化的服务器用于诊断问题
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// 基本中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

console.log('🔧 启动最简化服务器用于诊断...');

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'minimal-server', timestamp: new Date() });
});

// 简化的登录接口
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🎯 收到登录请求:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ 缺少邮箱或密码');
      return res.status(400).json({ 
        error: '邮箱和密码都是必需的',
        details: { email: !!email, password: !!password }
      });
    }

    // 模拟用户验证
    if (email === 'admin@example.com' && password === 'Admin123') {
      console.log('✅ 模拟登录成功');
      
      // 生成 token
      const token = jwt.sign({ id: 'mock-user-id', email }, 'debug-secret-key', { expiresIn: '7d' });
      
      return res.json({
        message: '登录成功',
        token,
        user: {
          id: 'mock-user-id',
          username: 'admin',
          email: 'admin@example.com',
          avatar: 'https://ui-avatars.com/api/?name=Admin',
          role: { name: 'super_admin', displayName: '超级管理员' },
          permissions: []
        }
      });
    } else {
      console.log('❌ 模拟登录失败 - 用户名或密码错误');
      return res.status(401).json({ 
        error: '邮箱或密码错误',
        details: { email, password }
      });
    }
  } catch (error) {
    console.error('❌ 登录过程出错:', error);
    res.status(500).json({ 
      error: '登录失败', 
      details: error.message,
      stack: error.stack 
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 最简化服务器启动成功！`);
  console.log(`📍 端口: ${PORT}`);
  console.log(`📋 测试登录: POST /api/auth/login {email: "admin@example.com", password: "Admin123"}`);
  console.log(`🏥 健康检查: GET /health`);
});

module.exports = app;