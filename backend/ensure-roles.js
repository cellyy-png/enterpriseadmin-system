const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function ensureRoles() {
  try {
    // 启动内存 MongoDB 服务器
    const mongod = await MongoMemoryServer.create({
      instance: {
        dbPath: require('path').join(__dirname, '../data/db'),
        storageEngine: 'wiredTiger'
      }
    });
    
    const uri = mongod.getUri();
    console.log('连接到内存数据库:', uri);
    
    // 连接到数据库
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true,
    });
    
    console.log('数据库连接成功');
    
    // 定义角色模型
    const roleSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
        unique: true,
        enum: ['super_admin', 'admin', 'user', 'merchant']
      },
      displayName: {
        type: String,
        required: true
      },
      permissions: [{
        resource: String,
        actions: [String]
      }],
      description: String,
      level: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now }
    });
    
    const Role = mongoose.model('Role', roleSchema);
    
    // 检查当前角色
    const existingRoles = await Role.find({});
    console.log('当前角色:', existingRoles.map(r => ({ name: r.name, displayName: r.displayName })));
    
    // 定义所有需要的角色
    const requiredRoles = [
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
        name: 'user',
        displayName: '普通用户',
        level: 10,
        permissions: [{ resource: 'product', actions: ['read'] }]
      },
      {
        name: 'merchant',
        displayName: '商家',
        level: 20,
        permissions: [
          { resource: 'product', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'order', actions: ['read', 'update'] }
        ]
      }
    ];

    // 检查并创建缺失的角色
    for (const roleData of requiredRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`创建角色: ${roleData.name} (${roleData.displayName})`);
      } else {
        console.log(`角色已存在: ${existingRole.name} (${existingRole.displayName})`);
      }
    }

    // 删除不需要的角色（如manager）
    const deleteResult = await Role.deleteMany({ name: 'manager' });
    if (deleteResult.deletedCount > 0) {
      console.log(`删除不需要的角色: manager (${deleteResult.deletedCount} 个)`);
    }

    console.log('角色修复完成');
    
    // 断开连接
    await mongoose.disconnect();
    await mongod.stop();
    
    console.log('数据库连接已断开');
    process.exit(0);
  } catch (err) {
    console.error('错误:', err);
    process.exit(1);
  }
}

ensureRoles();