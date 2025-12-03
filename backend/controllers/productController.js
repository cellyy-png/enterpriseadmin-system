const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');

exports.getAllProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category = '',
            minPrice = 0,
            maxPrice = Infinity,
            status = '',
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search = ''
        } = req.query;

        // 构建查询条件
        const query = {};

        if (category) query.category = category;
        if (status) query.status = status;

        query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };

        if (search) {
            query.$text = { $search: search };
        }

        // 排序
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // 分页查询
        const products = await Product.find(query)
            .populate('category', 'name slug')
            .populate('createdBy', 'username')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await Product.countDocuments(query);

        res.json({
            products,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('获取商品列表错误:', error);
        res.status(500).json({ error: '获取商品列表失败' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category')
            .populate('createdBy', 'username email');

        if (!product) {
            return res.status(404).json({ error: '商品不存在' });
        }

        // 增加浏览次数
        product.views += 1;
        await product.save();

        res.json({ product });
    } catch (error) {
        res.status(500).json({ error: '获取商品详情失败' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const productData = {
            ...req.body,
            createdBy: req.user._id
        };

        // 验证分类是否存在
        const category = await Category.findById(productData.category);
        if (!category) {
            return res.status(400).json({ error: '分类不存在' });
        }

        const product = await Product.create(productData);

        res.status(201).json({
            message: '商品创建成功',
            product
        });
    } catch (error) {
        console.error('创建商品错误:', error);
        res.status(500).json({ error: '创建商品失败' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('category');

        if (!product) {
            return res.status(404).json({ error: '商品不存在' });
        }

        res.json({ message: '更新成功', product });
    } catch (error) {
        res.status(500).json({ error: '更新商品失败' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ error: '商品不存在' });
        }

        res.json({ message: '删除成功' });
    } catch (error) {
        res.status(500).json({ error: '删除商品失败' });
    }
};

exports.searchProducts = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ error: '搜索关键词不能为空' });
        }

        const products = await Product.find(
            { $text: { $search: q } },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .limit(20)
            .populate('category');

        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: '搜索失败' });
    }
};