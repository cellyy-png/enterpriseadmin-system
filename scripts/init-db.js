const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Role = require('../backend/models/Role');
const User = require('../backend/models/User');
const Category = require('../backend/models/Category');
const path = require('path');
const fs = require('fs');

async function initDatabase() {
  try {
    // 1. 设置数据存储路径，确保与 backend/config/database.js 保持一致
    // 这样 app.js 启动时才能读取到这里初始化的数据
    const dbPath = path.join(__dirname, '../data/db');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    // 2. 启动带持久化的内存数据库
    const mongod = await MongoMemoryServer.create({
      instance: {
        dbPath: dbPath,
        storageEngine: 'wiredTiger'
      }
    });

    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✓ 本地数据库连接成功');

    // 清空现有数据
    await Promise.all([
      Role.deleteMany({}),
      User.deleteMany({}),
      Category.deleteMany({})
    ]).catch(err => {
      console.error('清空数据出错:', err);
    });
    console.log('✓ 清空现有数据完成');

    // 创建角色
    const roles = await Role.create([
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
        name: 'admin',
        displayName: '管理员',
        level: 80,
        permissions: [
          { resource: 'user', actions: ['read', 'update'] },
          { resource: 'product', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'order', actions: ['read', 'update'] },
          { resource: 'category', actions: ['read'] }
        ]
      },
      {
        name: 'manager',
        displayName: '经理',
        level: 50,
        permissions: [
          { resource: 'product', actions: ['read', 'update'] },
          { resource: 'order', actions: ['read'] }
        ]
      },
      {
        name: 'user',
        displayName: '普通用户',
        level: 10,
        permissions: [{ resource: 'product', actions: ['read'] }]
      }
    ]);
    console.log('✓ 创建角色成功');

    // 创建管理员账户
    const superAdminRole = roles.find(r => r.name === 'super_admin');


    // 不要手动调用 bcrypt.hash
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin123',
      role: superAdminRole._id,
      status: 'active'
    });

    console.log('✓ 创建管理员账户成功');
    console.log('  邮箱: admin@example.com');
    console.log('  密码: Admin123');

    // 创建默认分类
    await Category.create([
      { name: '电子产品', slug: 'electronics', level: 0, sortOrder: 1, isActive: true },
      { name: '服装鞋包', slug: 'fashion', level: 0, sortOrder: 2, isActive: true },
      { name: '食品饮料', slug: 'food', level: 0, sortOrder: 3, isActive: true },
      { name: '家居用品', slug: 'home', level: 0, sortOrder: 4, isActive: true }
    ]);
    console.log('✓ 创建默认分类成功');

    console.log('\n✅ 数据库初始化完成！');

    // 关闭连接并退出，让 app.js 重新接管数据库目录
    await mongoose.disconnect();
    await mongod.stop();
    console.log('数据库服务已停止，请运行 npm run dev (node app.js) 启动后端服务。');
    process.exit(0);

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  }
}

initDatabase();
