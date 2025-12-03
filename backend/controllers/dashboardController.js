const mongoose = require('mongoose');

exports.getOverview = async (req, res) => {
    try {
        // 总用户数
        const totalUsers = await User.countDocuments({ status: 'active' });

        // 总订单数
        const totalOrders = await Order.countDocuments();

        // 总销售额
        const totalRevenue = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // 商品总数
        const totalProducts = await Product.countDocuments({ status: 'active' });

        // 今日新增用户
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayUsers = await User.countDocuments({ createdAt: { $gte: today } });

        // 今日订单
        const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });

        res.json({
            totalUsers,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalProducts,
            todayUsers,
            todayOrders
        });
    } catch (error) {
        console.error('获取概览数据错误:', error);
        res.status(500).json({ error: '获取概览数据失败' });
    }
};

exports.getSalesTrend = async (req, res) => {
    try {
        const { period = '7days' } = req.query;

        let startDate = new Date();
        if (period === '7days') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === '30days') {
            startDate.setDate(startDate.getDate() - 30);
        } else if (period === '12months') {
            startDate.setMonth(startDate.getMonth() - 12);
        }

        const salesData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({ salesData });
    } catch (error) {
        res.status(500).json({ error: '获取销售趋势失败' });
    }
};