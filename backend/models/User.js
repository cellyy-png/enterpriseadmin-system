const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        select: false // 查询时默认不返回密码
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
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    phone: String,
    department: String,
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// 索引优化
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ status: 1 });

// 密码加密中间件
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// 密码验证方法
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// 虚拟字段：订单统计
userSchema.virtual('orderStats', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'user',
    count: true
});

module.exports = mongoose.model('User', userSchema);