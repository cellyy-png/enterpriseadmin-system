const mongoose = require('mongoose');
const Role = require('../backend/models/Role');

async function createMissingRoles() {
  try {
    // 连接数据库
    await mongoose.connect('mongodb://127.0.0.1:53660/', {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    console.log('✓ 数据库连接成功');

    // 创建缺失的角色
    const rolesToCreate = [
      {
        name: 'user',
        displayName: '普通用户',
        level: 10,
        permissions: [{ resource: 'product', actions: ['read'] }]
      }
    ];

    for (const role of rolesToCreate) {
      const existingRole = await Role.findOne({ name: role.name });
      if (!existingRole) {
        await Role.create(role);
        console.log(`✓ 创建角色: ${role.displayName}`);
      } else {
        console.log(`✓ 角色已存在: ${role.displayName}`);
      }
    }

    console.log('✅ 所有角色已创建完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 角色创建失败:', error);
    process.exit(1);
  }
}

createMissingRoles();