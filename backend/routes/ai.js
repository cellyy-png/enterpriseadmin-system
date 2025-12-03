const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate, checkPermission } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);
router.use(apiLimiter);

// AI 数据分析
router.post('/analyze-data',
    checkPermission('ai', 'read'),
    aiController.analyzeData
);

// AI 客服对话
router.post('/chat', aiController.aiChat);

// AI 生成报告
router.post('/generate-report',
    checkPermission('ai', 'read'),
    aiController.generateReport
);

// AI 预测销量
router.post('/predict-sales',
    checkPermission('ai', 'read'),
    aiController.predictSales
);

// AI 商品推荐
router.post('/recommend-products', aiController.recommendProducts);

// AI 图像识别（商品分类）
router.post('/image-recognition', aiController.imageRecognition);

module.exports = router;