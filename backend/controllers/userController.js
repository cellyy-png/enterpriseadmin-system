const User = require('../models/User');
const Role = require('../models/Role');
const Order = require('../models/Order');
const mongoose = require('mongoose');

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
        ).populate('role', 'name displayName');

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
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
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
                    user: new mongoose.Types.ObjectId(userId),
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

exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find({}, 'name displayName');
        res.json({ roles });
    } catch (error) {
        console.error('获取角色列表错误:', error);
        res.status(500).json({ error: '获取角色列表失败' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role, status = 'active' } = req.body;

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
        let assignedRole = null;
        if (role) {
            assignedRole = await Role.findById(role);
        }

        // 如果没有指定角色或找不到指定角色，则分配默认"user"角色
        if (!assignedRole) {
            assignedRole = await Role.findOne({ name: 'user' });
        }

        // 如果还找不到"user"角色，则抛出错误
        if (!assignedRole) {
            return res.status(500).json({ error: '系统中未找到默认用户角色' });
        }

        // 创建用户
        const user = await User.create({
            username,
            email,
            password,
            role: assignedRole._id,
            status
        });

        // 填充角色信息再返回
        const populatedUser = await User.findById(user._id).populate('role', 'name displayName');

        res.status(201).json({
            message: '用户创建成功',
            user: populatedUser
        });
    } catch (error) {
        console.error('创建用户错误:', error);
        res.status(500).json({ error: '创建用户失败' });
    }
};

// @desc    创建商家入驻申请
// @route   POST /api/users/merchant-application
// @access  Public
exports.createMerchantApplication = async (req, res) => {
  try {
    const { username, email, password, phone, department } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? '邮箱已被注册' : '用户名已存在'
      });
    }

    // 获取商家角色
    const merchantRole = await Role.findOne({ name: 'merchant' });
    
    if (!merchantRole) {
      return res.status(500).json({ 
        success: false, 
        message: '系统中未找到商家角色' 
      });
    }

    // 创建商家入驻申请用户（状态为pending）
    const user = await User.create({
      username,
      email,
      password,
      phone,
      department,
      role: merchantRole._id,
      status: 'pending'  // 待审核状态
    });

    // 填充角色信息再返回
    const populatedUser = await User.findById(user._id).populate('role', 'name displayName');

    res.status(201).json({
      success: true,
      message: '商家入驻申请提交成功，请等待审核',
      data: populatedUser
    });
  } catch (err) {
    console.error('创建商家入驻申请错误:', err);
    res.status(500).json({ 
      success: false, 
      message: '提交申请失败',
      error: err.message 
    });
  }
};

// @desc    获取商家入驻申请列表
// @route   GET /api/users/merchant-applications
// @access  Private/Admin
exports.getMerchantApplications = async (req, res) => {
  try {
    console.log('开始查询商家申请...');
    // 查找状态为 pending 的用户作为商家申请
    console.log('准备执行查询...');
    const users = await User.find({ status: 'pending' }).populate('role', 'name displayName permissions level');
    console.log('查询完成，结果数量:', users.length);
    console.log('查询结果:', JSON.stringify(users, null, 2));
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error('获取商家申请列表错误:', err);
    console.error('错误详情:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ success: false, message: '获取用户信息失败', error: err.message });
  }
};

// @desc    审核商家申请
// @route   PUT /api/users/merchant-audit/:id
// @access  Private/Admin
exports.auditMerchant = async (req, res) => {
  try {
    const { status, rejectReason } = req.body;
    // status 应该是 'active' (通过) 或 'rejected' (拒绝)

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    user.status = status;
    if (status === 'rejected') {
      // 当拒绝时，必须提供拒绝理由
      if (!rejectReason || typeof rejectReason !== 'string' || rejectReason.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: '拒绝申请必须提供拒绝理由'
        });
      }
      user.rejectReason = rejectReason;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: status === 'active' ? '审核通过' : '已拒绝申请',
      data: user
    });
  } catch (err) {
    console.error('审核商家申请错误:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    删除商家入驻申请
// @route   DELETE /api/users/merchant-application/:id
// @access  Private/Admin
exports.deleteMerchantApplication = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 检查用户是否存在且状态为pending
    const user = await User.findOne({ _id: userId, status: 'pending' });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '申请不存在或已处理' 
      });
    }

    // 删除用户
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: '商家入驻申请删除成功'
    });
  } catch (err) {
    console.error('删除商家入驻申请错误:', err);
    res.status(500).json({ 
      success: false, 
      message: '删除申请失败',
      error: err.message 
    });
  }
};
