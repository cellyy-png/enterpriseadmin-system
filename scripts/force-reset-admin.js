const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');

// 引入模型
const Role = require('../backend/models/Role');
const User = require('../backend/models/User');

async function forceResetAdmin() {
  try {
    console.log('🔧 强制重置管理员用户...');
    
    // 确保存储数据的目录存在
    const dbPath = path.join(__dirname, '../data/db');
    console.log('📁 数据库路径:', dbPath);
    
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
      console.log('📂 创建数据库目录');
    }

    // 连接数据库
    console.log('🔄 启动数据库...');
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

    // 确保角色存在
    console.log('📋 确保角色存在...');
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
    }
    console.log('✅ 超级管理员角色准备就绪');

    // 强制创建或更新管理员用户
    console.log('👤 强制重置管理员用户...');
    const plainPassword = 'Admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    
    // 先尝试查找用户
    let adminUser = await User.findOne({ email: 'admin@example.com' });
    
    if (adminUser) {
      // 更新现有用户
      console.log('🔄 更新现有管理员用户...');
      adminUser = await User.findByIdAndUpdate(
        adminUser._id,
        {
          username: 'admin',
          email: 'admin@example.com',
          password: hashedPassword,
          role: superAdminRole._id,
          status: 'active',
          updatedAt: new Date()
        },
        { new: true, upsert: true }
      );
      console.log('✅ 管理员用户已更新');
    } else {
      // 创建新用户
      console.log('🆕 创建新的管理员用户...');
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: superAdminRole._id,
        status: 'active'
      });
      console.log('✅ 管理员用户已创建');
    }

    // 验证密码
    console.log('🔍 验证密码...');
    const testPassword = 'Admin123';
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    console.log('🔐 密码哈希验证:', isMatch ? '通过' : '失败');
    
    // 再次验证用户数据
    const verifyUser = await User.findOne({ email: 'admin@example.com' })
      .select('+password')
      .populate('role');
    
    if (verifyUser) {
      console.log('📋 用户详细信息:');
      console.log('   ID:', verifyUser._id);
      console.log('   用户名:', verifyUser.username);
      console.log('   邮箱:', verifyUser.email);
      console.log('   角色:', verifyUser.role?.name);
      console.log('   状态:', verifyUser.status);
      
      // 测试密码比较函数
      const passwordValid = await verifyUser.comparePassword('Admin123');
      console.log('🔐 密码比较函数测试:', passwordValid ? '通过' : '失败');
    }

    console.log('\n🎉 管理员用户强制重置完成！');
    console.log('📧 登录邮箱: admin@example.com');
    console.log('🔑 登录密码: Admin123');
    console.log('💡 请务必使用以上凭据登录系统');
    
    await mongoose.disconnect();
    console.log("👋 数据库连接已断开");
    process.exit(0);
  } catch (error) {
    console.error('❌ 强制重置过程中发生错误:', error);
    process.exit(1);
  }
}

forceResetAdmin();