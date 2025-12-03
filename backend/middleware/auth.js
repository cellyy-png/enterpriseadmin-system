const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// 生成 JWT Token
exports.generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// 验证 Token
exports.authenticate = async (req, res, next) => {
    try {
        // 从 header 中获取 token
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: '未提供认证令牌' });
        }

        // 验证 token
        const decoded = jwt.verify(token, JWT_SECRET);

        // 查找用户（包含角色信息）
        const user = await User.findById(decoded.id)
            .populate('role')
            .select('-password');

        if (!user) {
            return res.status(401).json({ error: '用户不存在' });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ error: '账户已被停用' });
        }

        // 将用户信息挂载到 req
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token已过期，请重新登录' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: '无效的Token' });
        }
        return res.status(401).json({ error: '认证失败' });
    }
};