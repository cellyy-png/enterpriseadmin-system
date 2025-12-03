const { body, param, query, validationResult } = require('express-validator');

exports.validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        return res.status(400).json({
            error: '数据验证失败',
            details: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    };
};

// 常用验证规则
exports.userValidation = {
    register: [
        body('username')
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('用户名长度为3-30个字符')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('用户名只能包含字母、数字和下划线'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('邮箱格式不正确'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('密码至少6个字符')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('密码必须包含大小写字母和数字')
    ],
    login: [
        body('email').isEmail().withMessage('邮箱格式不正确'),
        body('password').notEmpty().withMessage('密码不能为空')
    ]
};

exports.productValidation = {
    create: [
        body('name').trim().notEmpty().withMessage('商品名称不能为空'),
        body('sku').trim().notEmpty().withMessage('SKU不能为空'),
        body('price').isFloat({ min: 0 }).withMessage('价格必须大于0'),
        body('stock').isInt({ min: 0 }).withMessage('库存必须为非负整数'),
        body('category').isMongoId().withMessage('分类ID格式不正确')
    ]
};

exports.orderValidation = {
    create: [
        body('items').isArray({ min: 1 }).withMessage('订单至少包含一个商品'),
        body('items.*.product').isMongoId().withMessage('商品ID格式不正确'),
        body('items.*.quantity').isInt({ min: 1 }).withMessage('商品数量必须大于0')
    ]
};