const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Role = require('./models/Role');

// 使用与后端应用相同的数据库连接方式
async function fixRoles() {
  try {
    // 连接到数据库（这将使用与后端相同的方法）
    await connectDB();
    console.log('数据库连接成功');

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
    const unwantedRoles = ['manager'];
    for (const roleName of unwantedRoles) {
      const unwantedRole = await Role.findOne({ name: roleName });
      if (unwantedRole) {
        await Role.deleteOne({ name: roleName });
        console.log(`删除不需要的角色: ${roleName}`);
      }
    }

    console.log('角色修复完成');
    
    // 等待所有操作完成后再断开连接
    setTimeout(() => {
      mongoose.disconnect();
      console.log('数据库连接已断开');
      process.exit(0);
    }, 1000);
  } catch (err) {
    console.error('错误:', err);
    process.exit(1);
  }
}

fixRoles();