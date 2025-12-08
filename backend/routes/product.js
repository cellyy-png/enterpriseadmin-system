const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, checkPermission } = require('../middleware/auth');
const { validate, productValidation } = require('../middleware/validation');
const { cacheMiddleware, clearCache } = require('../middleware/cache');

// 公开接口（不需要认证）
router.get('/', cacheMiddleware(300), productController.getAllProducts);
router.get('/:id', cacheMiddleware(300), productController.getProductById);
router.get('/search', productController.searchProducts);

// 需要认证的接口
router.use(authenticate);

router.post('/',
    checkPermission('product', 'create'),
    validate(productValidation.create),
    clearCache('products*'),
    productController.createProduct
);

router.put('/:id',
    checkPermission('product', 'update'),
    clearCache('products*'),
    productController.updateProduct
);

router.delete('/:id',
    checkPermission('product', 'delete'),
    clearCache('products*'),
    productController.deleteProduct
);

// router.post('/:id/upload-images',
//     checkPermission('product', 'update'),
//     productController.uploadImages
// ); // uploadImages 方法未定义

module.exports = router;