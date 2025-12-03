const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { items, shippingAddress, paymentMethod, notes } = req.body;

        // 验证商品库存并计算总价
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product).session(session);

            if (!product) {
                throw new Error(`商品 ${item.product} 不存在`);
            }

            if (product.stock < item.quantity) {
                throw new Error(`商品 ${product.name} 库存不足`);
            }

            // 扣减库存
            product.stock -= item.quantity;
            product.sales += item.quantity;
            await product.save({ session });

            const subtotal = product.price * item.quantity;
            totalAmount += subtotal;

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price,
                subtotal
            });
        }

        // 创建订单
        const order = await Order.create([{
            user: req.user._id,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod,
            notes
        }], { session });

        await session.commitTransaction();

        res.status(201).json({
            message: '订单创建成功',
            order: order[0]
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('创建订单错误:', error);
        res.status(500).json({ error: error.message || '创建订单失败' });
    } finally {
        session.endSession();
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status = '',
            paymentStatus = '',
            startDate = '',
            endDate = '',
            userId = ''
        } = req.query;

        const query = {};

        // 普通用户只能查看自己的订单
        if (!['super_admin', 'admin'].includes(req.user.role.name)) {
            query.user = req.user._id;
        } else if (userId) {
            query.user = userId;
        }

        if (status) query.status = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const orders = await Order.find(query)
            .populate('user', 'username email')
            .populate('items.product', 'name sku images')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(query);

        res.json({
            orders,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: '获取订单列表失败' });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'username email phone')
            .populate('items.product');

        if (!order) {
            return res.status(404).json({ error: '订单不存在' });
        }

        // 权限检查：普通用户只能查看自己的订单
        if (!['super_admin', 'admin'].includes(req.user.role.name)) {
            if (order.user._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: '无权查看此订单' });
            }
        }

        res.json({ order });
    } catch (error) {
        res.status(500).json({ error: '获取订单详情失败' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: '订单不存在' });
        }

        order.status = status;

        // 根据状态更新时间戳
        if (status === 'shipped') {
            order.shippedAt = new Date();
        } else if (status === 'delivered') {
            order.deliveredAt = new Date();
        }

        await order.save();

        res.json({ message: '订单状态更新成功', order });
    } catch (error) {
        res.status(500).json({ error: '更新订单状态失败' });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: '订单不存在' });
        }

        order.paymentStatus = paymentStatus;

        if (paymentStatus === 'paid') {
            order.paidAt = new Date();
            order.status = 'confirmed';
        }

        await order.save();

        res.json({ message: '支付状态更新成功', order });
    } catch (error) {
        res.status(500).json({ error: '更新支付状态失败' });
    }
};

exports.cancelOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findById(req.params.id).session(session);

        if (!order) {
            throw new Error('订单不存在');
        }

        if (order.status === 'delivered') {
            throw new Error('已送达的订单无法取消');
        }

        // 恢复库存
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        stock: item.quantity,
                        sales: -item.quantity
                    }
                },
                { session }
            );
        }

        order.status = 'cancelled';
        await order.save({ session });

        await session.commitTransaction();

        res.json({ message: '订单已取消', order });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error: error.message || '取消订单失败' });
    } finally {
        session.endSession();
    }
};