// 检查数据库中的用户数据
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function checkDBData() {
    console.log('🔍 检查数据库中的用户数据...');
    
    try {
        // 启动内存数据库
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        
        console.log('📊 连接到内存数据库:', uri);
        
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            autoIndex: true,
        });
        
        // 动态定义 User 和 Role 模型（复制自项目文件）
        const userSchema = new mongoose.Schema({
            username: {
                type: String,
                required: [true, '用户名不能为空'],
                unique: true,
                trim: true,
                minlength: [3, '用户名至少3个字符'],
                maxlength: [30, '用户名最多30个字符']
            },
            email: {
                type: String,
                required: [true, '邮箱不能为空'],
                unique: true,
                lowercase: true,
                match: [/^\S+@\S+\.\S+$/, '邮箱格式不正确']
            },
            password: {
                type: String,
                required: [true, '密码不能为空'],
                minlength: [6, '密码至少6个字符'],
                select: false
            },
            avatar: {
                type: String,
                default: 'https://ui-avatars.com/api/?name=User'
            },
            role: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Role',
                required: true
            },
            status: {
                type: String,
                enum: ['active', 'inactive', 'suspended', 'pending', 'rejected'],
                default: 'active'
            },
            phone: String,
            department: String,
            lastLogin: Date,
            loginCount: { type: Number, default: 0 },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now },
            rejectReason: {
                type: String,
                default: null
            }
        }, {
            timestamps: true,
            toJSON: { virtuals: true },
            toObject: { virtuals: true }
        });

        const roleSchema = new mongoose.Schema({
            name: { type: String, required: true, unique: true },
            displayName: { type: String, required: true },
            level: { type: Number, required: true },
            permissions: [{
                resource: String,
                actions: [String]
            }]
        });

        const User = mongoose.model('User', userSchema);
        const Role = mongoose.model('Role', roleSchema);
        
        // 检查用户
        const users = await User.find({}).populate('role');
        console.log(`📋 发现 ${users.length} 个用户:`);
        users.forEach(user => {
            console.log(`  - ${user.username} (${user.email}), 角色: ${user.role ? user.role.displayName : 'N/A'}, 状态: ${user.status}`);
        });
        
        // 检查角色
        const roles = await Role.find({});
        console.log(`🏷️  发现 ${roles.length} 个角色:`);
        roles.forEach(role => {
            console.log(`  - ${role.displayName} (${role.name}), 权限数: ${role.permissions.length}`);
        });
        
        // 尝试查找管理员用户
        const adminUser = await User.findOne({ email: 'admin@example.com' }).select('+password').populate('role');
        if (adminUser) {
            console.log('\n🔐 管理员用户存在:');
            console.log(`  邮箱: ${adminUser.email}`);
            console.log(`  用户名: ${adminUser.username}`);
            console.log(`  状态: ${adminUser.status}`);
            console.log(`  角色: ${adminUser.role ? adminUser.role.displayName : 'N/A'}`);
            console.log(`  密码字段存在: ${!!adminUser.password}`);
        } else {
            console.log('\n❌ 未找到管理员用户 admin@example.com');
        }
        
        await mongoose.disconnect();
        await mongod.stop();
        
        console.log('\n✅ 数据库检查完成');
    } catch (error) {
        console.error('❌ 数据库检查失败:', error.message);
        console.error('详细错误:', error);
    }
}

checkDBData();