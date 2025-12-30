// 简单测试脚本，用于调试登录问题
const mongoose = require('mongoose');

// 连接数据库
async function testConnection() {
    try {
        console.log('尝试连接数据库...');
        await mongoose.connect('mongodb://localhost:27017/enterpriseadmin', {
            serverSelectionTimeoutMS: 5000
        });
        console.log('数据库连接成功');
        
        // 导入模型
        const User = require('./backend/models/User');
        const Role = require('./backend/models/Role');
        
        // 查找用户
        console.log('查找用户...');
        const user = await User.findOne({ email: 'admin@example.com' }).select('+password').populate('role');
        
        if (!user) {
            console.log('未找到管理员用户，创建一个...');
            // 查找或创建角色
            let role = await Role.findOne({ name: 'super_admin' });
            if (!role) {
                console.log('创建超级管理员角色...');
                role = await Role.create({
                    name: 'super_admin',
                    displayName: '超级管理员',
                    level: 100,
                    permissions: [
                        { resource: 'user', actions: ['create', 'read', 'update', 'delete'] },
                        { resource: 'product', actions: ['create', 'read', 'update', 'delete'] },
                        { resource: 'order', actions: ['create', 'read', 'update', 'delete'] },
                        { resource: 'category', actions: ['create', 'read', 'update', 'delete'] },
                        { resource: 'carousel', actions: ['create', 'read', 'update', 'delete'] },
                        { resource: 'ai', actions: ['read'] }
                    ]
                });
            }
            
            // 创建用户
            const newUser = new User({
                username: 'admin',
                email: 'admin@example.com',
                password: 'Admin123',
                role: role._id,
                status: 'active'
            });
            
            await newUser.save();
            console.log('管理员用户创建成功');
            
            // 重新查找用户
            const savedUser = await User.findOne({ email: 'admin@example.com' }).select('+password').populate('role');
            console.log('用户信息:', {
                id: savedUser._id,
                email: savedUser.email,
                role: savedUser.role?.displayName,
                status: savedUser.status
            });
            
            // 测试密码比较
            console.log('测试密码比较...');
            const isPasswordValid = await savedUser.comparePassword('Admin123');
            console.log('密码验证结果:', isPasswordValid);
        } else {
            console.log('找到用户:', {
                id: user._id,
                email: user.email,
                role: user.role?.displayName,
                status: user.status
            });
            
            // 测试密码比较
            console.log('测试密码比较...');
            const isPasswordValid = await user.comparePassword('Admin123');
            console.log('密码验证结果:', isPasswordValid);
        }
        
        await mongoose.connection.close();
        console.log('数据库连接已关闭');
    } catch (error) {
        console.error('错误详情:', error);
        console.error('错误名称:', error.name);
        console.error('错误消息:', error.message);
        console.error('错误堆栈:', error.stack);
        if (mongoose.connection.readyState) {
            await mongoose.connection.close();
        }
    }
}

testConnection();