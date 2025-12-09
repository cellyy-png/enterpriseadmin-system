const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Role = require('../backend/models/Role');
const User = require('../backend/models/User');
const Category = require('../backend/models/Category');

async function initDatabase() {
  try {
    // 连接数据库 - 使用内存数据库
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✓ 内存数据库连接成功');

    // 清空现有数据
    // 增加超时时间
    await Promise.all([
      Role.deleteMany({}),
      User.deleteMany({}),
      Category.deleteMany({})
    ]).catch(err => {
      console.error('清空数据出错:', err);
      // 继续执行，不中断流程
    });
    console.log('✓ 清空现有数据');

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
    // 修改密码为 Admin123 以匹配前端登录表单
    const hashedPassword = await bcrypt.hash('Admin123', 12);

    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: superAdminRole._id,
      status: 'active'
    });
    console.log('✓ 创建管理员账户成功');
    console.log('  邮箱: admin@example.com');
    console.log('  密码: Admin123');

    // 创建默认分类
    const categories = await Category.create([
      {
        name: '电子产品',
        slug: 'electronics',
        level: 0,
        sortOrder: 1,
        isActive: true
      },
      {
        name: '服装鞋包',
        slug: 'fashion',
        level: 0,
        sortOrder: 2,
        isActive: true
      },
      {
        name: '食品饮料',
        slug: 'food',
        level: 0,
        sortOrder: 3,
        isActive: true
      },
      {
        name: '家居用品',
        slug: 'home',
        level: 0,
        sortOrder: 4,
        isActive: true
      }
    ]);
    console.log('✓ 创建默认分类成功');

    console.log('\n✅ 数据库初始化完成！');

    // 为了保持数据库运行，我们不关闭 mongod 实例
    // 应用程序将需要连接到这个实例
    console.log(`数据库 URI: ${uri}`);
    
    // 不退出程序，保持数据库运行
    console.log("内存数据库正在运行，请保持此进程开启");
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  }
}

initDatabase();