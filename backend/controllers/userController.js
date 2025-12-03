const User = require('../models/User');
const Order = require('../models/Order');

exports.getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            role = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // 构建查询条件
        const query = {};

        if (search) {
            query.$or = [
                { username: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        if (status) query.status = status;
        if (role) query.role = role;

        // 排序
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // 分页查询
        const users = await User.find(query)
            .populate('role', 'name displayName')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-password');

        const total = await User.countDocuments(query);

        res.json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('获取用户列表错误:', error);
        res.status(500).json({ error: '获取用户列表失败' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('role')
            .select('-password');

        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: '获取用户信息失败' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { username, email, status, role, department, phone } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { username, email, status, role, department, phone },
            { new: true, runValidators: true }
        ).populate('role');

        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        res.json({ message: '更新成功', user });
    } catch (error) {
        res.status(500).json({ error: '更新用户失败' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        res.json({ message: '删除成功' });
    } catch (error) {
        res.status(500).json({ error: '删除用户失败' });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const userId = req.params.id;

        // 订单统计
        const orderStats = await Order.aggregate([
            { $match: { user: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        // 总消费
        const totalSpent = await Order.aggregate([
            {
                $match: {
                    user: mongoose.Types.ObjectId(userId),
                    paymentStatus: 'paid'
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            orderStats,
            totalSpent: totalSpent[0]?.total || 0,
            orderCount: await Order.countDocuments({ user: userId })
        });
    } catch (error) {
        res.status(500).json({ error: '获取用户统计失败' });
    }
};
