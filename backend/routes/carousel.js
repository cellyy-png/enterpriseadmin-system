const express = require('express');
const router = express.Router();
const {
  getCarousels,
  createCarousel,
  updateCarousel,
  deleteCarousel
} = require('../controllers/carouselController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission');
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
        cb(null, 'carousel-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制文件大小为5MB
    },
    fileFilter: (req, file, cb) => {
        // 只允许图片文件
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件!'), false);
        }
    }
});

// 添加单独的上传端点
router.post('/upload-image', authenticate, checkPermission('carousel', 'create'), upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: '没有上传文件' });
    }
    
    // 返回上传的文件信息
    res.json({ 
        success: true, 
        message: '图片上传成功', 
        url: `/uploads/${req.file.filename}` // 返回相对路径
    });
});

// 轮播图管理路由
router.route('/')
  .get(authenticate, checkPermission('carousel', 'read'), getCarousels)
  .post(authenticate, checkPermission('carousel', 'create'), upload.single('image'), createCarousel);

router.route('/:id')
  .put(authenticate, checkPermission('carousel', 'update'), upload.single('image'), updateCarousel)
  .delete(authenticate, checkPermission('carousel', 'delete'), deleteCarousel);

module.exports = router;