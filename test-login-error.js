const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Role = require('./backend/models/Role');

async function testLogin() {
    try {
        console.log('正在连接数据库...');
        await mongoose.connect('mongodb://localhost:27017/enterpriseadmin', {
            serverSelectionTimeoutMS: 5000,
            autoIndex: true,
        });

        console.log('数据库连接成功');

        // 查找所有用户
        const users = await User.find({}).select('+password').populate('role');
        console.log('找到用户数量:', users.length);
        console.log('用户列表:');
        users.forEach(user => {
            console.log(`- ID: ${user._id}, Email: ${user.email}, Role: ${user.role?.displayName || 'N/A'}, Status: ${user.status}`);
        });

        // 查找角色
        const roles = await Role.find({});
        console.log('\n找到角色数量:', roles.length);
        console.log('角色列表:');
        roles.forEach(role => {
            console.log(`- ID: ${role._id}, Name: ${role.name}, Display: ${role.displayName}`);
        });

        // 测试密码比较功能
        if (users.length > 0) {
            const testUser = users[0];
            console.log('\n测试密码比较功能...');
            console.log('测试密码:', 'Admin123');
            console.log('用户密码字段:', testUser.password ? '存在' : '不存在');
            console.log('密码长度:', testUser.password ? testUser.password.length : 'N/A');
            
            try {
                const isValid = await testUser.comparePassword('Admin123');
                console.log('密码比较结果:', isValid);
            } catch (compareError) {
                console.error('密码比较错误:', compareError);
                console.error('比较错误类型:', compareError.name);
                console.error('比较错误消息:', compareError.message);
                console.error('比较错误堆栈:', compareError.stack);
            }
        } else {
            console.log('\n没有找到用户，创建一个测试用户');
            // 尝试创建默认用户
            let defaultRole = await Role.findOne({ name: 'user' });
            if (!defaultRole) {
                defaultRole = await Role.create({
                    name: 'user',
                    displayName: '普通用户',
                    level: 1,
                    permissions: []
                });
                console.log('创建了默认用户角色');
            }
            
            const newUser = new User({
                username: 'testuser',
                email: 'test@example.com',
                password: 'Test123456',
                role: defaultRole._id
            });
            
            await newUser.save();
            console.log('创建了测试用户');
            
            // 再次尝试密码比较
            const savedUser = await User.findOne({ email: 'test@example.com' }).select('+password');
            const isValid = await savedUser.comparePassword('Test123456');
            console.log('新用户密码比较结果:', isValid);
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

testLogin().then(() => console.log('测试完成')).catch(err => console.error('测试失败', err));