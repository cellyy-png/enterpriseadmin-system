const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, checkPermission } = require('../middleware/auth');
const { validate, productValidation } = require('../middleware/validation');
const { cacheMiddleware, clearCache } = require('../middleware/cache');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 用于文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 使用时间戳+随机数生成唯一文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制文件大小为5MB
    }
});

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

router.post('/upload-image', 
    checkPermission('product', 'create'),
    upload.single('image'),
    productController.uploadProductImage
);

module.exports = router;