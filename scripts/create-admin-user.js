const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');

// 引入模型（使用绝对路径）
const Role = require('../backend/models/Role');
const User = require('../backend/models/User');

async function createAdminUser() {
  try {
    console.log('🔧 开始创建管理员用户...');
    
    // MongoDB连接URI
    const dbPath = path.join(__dirname, '../data/db');
    console.log('📁 数据库路径:', dbPath);
    
    // 确保目录存在
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
      console.log('📂 创建数据库目录');
    }

    // 连接到正在运行的应用数据库
    console.log('🔗 连接到应用数据库...');
    // 使用应用正在运行的同一个数据库实例
    const mongod = await MongoMemoryServer.create({
      instance: {
        dbPath: dbPath,
        storageEngine: 'wiredTiger'
      }
    });
    
    const uri = mongod.getUri();
    console.log('🔗 数据库URI:', uri);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      autoIndex: true,
    });
    
    console.log('✅ 数据库连接成功');

    // 检查并创建角色
    console.log('📋 检查角色...');
    let superAdminRole = await Role.findOne({ name: 'super_admin' });
    
    if (!superAdminRole) {
      console.log('🆕 创建超级管理员角色...');
      superAdminRole = await Role.create({
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
      console.log('✅ 超级管理员角色创建完成');
    } else {
      console.log('✅ 超级管理员角色已存在');
    }

    // 检查并创建管理员用户
    console.log('👤 检查管理员用户...');
    let adminUser = await User.findOne({ email: 'admin@example.com' });
    
    // 生成密码哈希
    const plainPassword = 'Admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    
    if (adminUser) {
      console.log('🔄 更新现有管理员用户...');
      await User.updateOne(
        { email: 'admin@example.com' },
        {
          $set: {
            username: 'admin',
            password: hashedPassword,
            role: superAdminRole._id,
            status: 'active',
            updatedAt: new Date()
          }
        }
      );
      console.log('✅ 管理员用户已更新');
    } else {
      console.log('🆕 创建新的管理员用户...');
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: superAdminRole._id,
        status: 'active'
      });
      console.log('✅ 管理员用户创建完成');
    }

    // 验证用户创建结果
    console.log('🔍 验证用户信息...');
    const verifyUser = await User.findOne({ email: 'admin@example.com' })
      .select('+password')
      .populate('role');
    
    if (verifyUser) {
      const isPasswordValid = await verifyUser.comparePassword(plainPassword);
      console.log('🔐 密码验证:', isPasswordValid ? '通过' : '失败');
      console.log('   用户名:', verifyUser.username);
      console.log('   邮箱:', verifyUser.email);
      console.log('   角色:', verifyUser.role?.name);
      console.log('   状态:', verifyUser.status);
    }

    console.log('\n🎉 管理员用户设置完成！');
    console.log('📧 登录邮箱: admin@example.com');
    console.log('🔑 登录密码: Admin123');
    console.log('💡 请使用以上凭据登录系统');
    
    await mongoose.disconnect();
    console.log("👋 数据库连接已断开");
    process.exit(0);
  } catch (error) {
    console.error('❌ 创建用户过程中发生错误:', error);
    process.exit(1);
  }
}

createAdminUser();