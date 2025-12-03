const User = require('../models/User');
const Role = require('../models/Role');
const { generateToken } = require('../middleware/auth');

exports.register = async (req, res) => {
    try {
        const { username, email, password, roleId } = req.body;

        // 检查用户是否已存在
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                error: existingUser.email === email ? '邮箱已被注册' : '用户名已存在'
            });
        }

        // 分配默认角色
        let role = await Role.findById(roleId);
        if (!role) {
            role = await Role.findOne({ name: 'user' });
        }

        // 创建用户
        const user = await User.create({
            username,
            email,
            password,
            role: role._id
        });

        // 生成 token
        const token = generateToken(user._id);

        res.status(201).json({
            message: '注册成功',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: role.displayName
            }
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ error: '注册失败' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 查找用户（包含密码字段）
        const user = await User.findOne({ email })
            .select('+password')
            .populate('role');

        if (!user) {
            return res.status(401).json({ error: '邮箱或密码错误' });
        }

        // 验证密码
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: '邮箱或密码错误' });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ error: '账户已被停用' });
        }

        // 更新登录信息
        user.lastLogin = new Date();
        user.loginCount += 1;
        await user.save();

        // 生成 token
        const token = generateToken(user._id);

        res.json({
            message: '登录成功',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                permissions: user.role.permissions
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ error: '登录失败' });
    }
};

exports.getCurrentUser = async (req, res) => {
    res.json({ user: req.user });
};

exports.logout = async (req, res) => {
    // 在实际应用中，可以将 token 加入黑名单（Redis）
    res.json({ message: '退出成功' });
};