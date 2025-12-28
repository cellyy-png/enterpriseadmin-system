const connectDB = require('./config/database');
const mongoose = require('mongoose');

console.log('尝试连接数据库...');

connectDB()
  .then(() => {
    console.log('数据库连接成功');
    
    // 检查角色集合
    const Role = require('./models/Role');
    
    return Role.find({}).select('name displayName level permissions');
  })
  .then(roles => {
    console.log('当前数据库中的角色:');
    roles.forEach(role => {
      console.log(`- ${role.name} (${role.displayName}), level: ${role.level}`);
    });
    
    // 确保所有必需的角色都存在
    const requiredRoles = ['super_admin', 'admin', 'user', 'merchant'];
    const existingRoleNames = roles.map(r => r.name);
    
    const missingRoles = requiredRoles.filter(role => !existingRoleNames.includes(role));
    console.log('缺失的角色:', missingRoles);
    
    if (missingRoles.length > 0) {
      console.log('需要创建缺失的角色...');
      
      // 创建缺失的角色
      const roleDefinitions = {
        super_admin: {
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
        admin: {
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
        user: {
          name: 'user',
          displayName: '普通用户',
          level: 10,
          permissions: [{ resource: 'product', actions: ['read'] }]
        },
        merchant: {
          name: 'merchant',
          displayName: '商家',
          level: 20,
          permissions: [
            { resource: 'product', actions: ['create', 'read', 'update', 'delete'] },
            { resource: 'order', actions: ['read', 'update'] }
          ]
        }
      };
      
      const Role = require('./models/Role');
      
      return Promise.all(
        missingRoles.map(roleName => {
          console.log(`创建角色: ${roleName}`);
          return Role.create(roleDefinitions[roleName]);
        })
      ).then(() => {
        console.log('缺失角色创建完成');
        return Role.find({}).select('name displayName');
      });
    }
    
    return roles;
  })
  .then(updatedRoles => {
    console.log('最终角色列表:');
    updatedRoles.forEach(role => {
      console.log(`- ${role.name} (${role.displayName})`);
    });
    
    console.log('角色检查和修复完成');
    process.exit(0);
  })
  .catch(err => {
    console.error('错误:', err);
    process.exit(1);
  });