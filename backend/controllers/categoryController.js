const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getAllCategories = async (req, res) => {
    try {
        const { level = '', isActive = '' } = req.query;

        const query = {};
        if (level !== '') query.level = parseInt(level);
        if (isActive !== '') query.isActive = isActive === 'true';

        const categories = await Category.find(query)
            .populate('parent', 'name slug')
            .sort({ sortOrder: 1, name: 1 });

        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ error: '获取分类列表失败' });
    }
};

exports.getCategoryTree = async (req, res) => {
    try {
        // 获取所有根分类
        const rootCategories = await Category.find({ parent: null, isActive: true })
            .sort({ sortOrder: 1 });

        // 递归构建分类树
        const buildTree = async (category) => {
            const children = await Category.find({ parent: category._id, isActive: true })
                .sort({ sortOrder: 1 });

            return {
                ...category.toObject(),
                children: await Promise.all(children.map(child => buildTree(child)))
            };
        };

        const tree = await Promise.all(rootCategories.map(cat => buildTree(cat)));

        res.json({ tree });
    } catch (error) {
        res.status(500).json({ error: '获取分类树失败' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, slug, parent, description, icon, image } = req.body;

        // 如果有父分类，计算层级
        let level = 0;
        if (parent) {
            const parentCategory = await Category.findById(parent);
            if (!parentCategory) {
                return res.status(400).json({ error: '父分类不存在' });
            }
            level = parentCategory.level + 1;
        }

        const category = await Category.create({
            name,
            slug,
            parent,
            level,
            description,
            icon,
            image
        });

        res.status(201).json({
            message: '分类创建成功',
            category
        });
    } catch (error) {
        res.status(500).json({ error: '创建分类失败' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ error: '分类不存在' });
        }

        res.json({ message: '更新成功', category });
    } catch (error) {
        res.status(500).json({ error: '更新分类失败' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        // 检查是否有子分类
        const hasChildren = await Category.exists({ parent: req.params.id });
        if (hasChildren) {
            return res.status(400).json({ error: '该分类下存在子分类，无法删除' });
        }

        // 检查是否有商品
        const hasProducts = await Product.exists({ category: req.params.id });
        if (hasProducts) {
            return res.status(400).json({ error: '该分类下存在商品，无法删除' });
        }

        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({ error: '分类不存在' });
        }

        res.json({ message: '删除成功' });
    } catch (error) {
        res.status(500).json({ error: '删除分类失败' });
    }
};