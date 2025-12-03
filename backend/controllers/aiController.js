const axios = require('axios');
const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// OpenAI API 配置（可替换为其他 AI 服务）
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// ============================================
// AI 数据分析
// ============================================
exports.analyzeData = async (req, res) => {
    try {
        const { dataType, timeRange = '30days' } = req.body;

        let data, analysis;

        switch (dataType) {
            case 'sales':
                data = await analyzeSalesData(timeRange);
                break;
            case 'users':
                data = await analyzeUserData(timeRange);
                break;
            case 'products':
                data = await analyzeProductData(timeRange);
                break;
            default:
                return res.status(400).json({ error: '不支持的数据类型' });
        }

        // 使用 AI 生成分析报告
        const prompt = `
      请分析以下${dataType}数据，并生成专业的分析报告：
      ${JSON.stringify(data, null, 2)}
      
      请包括：
      1. 数据趋势分析
      2. 关键指标解读
      3. 潜在问题识别
      4. 优化建议
    `;

        const aiResponse = await callOpenAI(prompt);

        res.json({
            rawData: data,
            analysis: aiResponse,
            generatedAt: new Date()
        });
    } catch (error) {
        console.error('AI 数据分析错误:', error);
        res.status(500).json({ error: 'AI 数据分析失败' });
    }
};

// 销售数据分析
async function analyzeSalesData(timeRange) {
    const startDate = getStartDate(timeRange);

    const [totalRevenue, orderCount, avgOrderValue, topProducts] = await Promise.all([
        // 总收入
        Order.aggregate([
            { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),

        // 订单数
        Order.countDocuments({ createdAt: { $gte: startDate } }),

        // 平均订单金额
        Order.aggregate([
            { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
            { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
        ]),

        // 热销商品
        Order.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalSold: { $sum: '$items.quantity' },
                    revenue: { $sum: '$items.subtotal' }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' }
        ])
    ]);

    return {
        totalRevenue: totalRevenue[0]?.total || 0,
        orderCount,
        avgOrderValue: avgOrderValue[0]?.avg || 0,
        topProducts
    };
}

// 用户数据分析
async function analyzeUserData(timeRange) {
    const startDate = getStartDate(timeRange);

    const [newUsers, activeUsers, userGrowth] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: startDate } }),

        User.countDocuments({
            lastLogin: { $gte: startDate },
            status: 'active'
        }),

        User.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])
    ]);

    return { newUsers, activeUsers, userGrowth };
}

// 商品数据分析
async function analyzeProductData(timeRange) {
    const startDate = getStartDate(timeRange);

    const [lowStock, topRated, categoryDistribution] = await Promise.all([
        Product.find({ stock: { $lt: 10 }, status: 'active' })
            .select('name sku stock')
            .limit(20),

        Product.find({ status: 'active' })
            .sort({ rating: -1, reviewCount: -1 })
            .limit(10)
            .select('name rating reviewCount'),

        Product.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalStock: { $sum: '$stock' }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'category'
                }
            }
        ])
    ]);

    return { lowStock, topRated, categoryDistribution };
}

// ============================================
// AI 客服对话
// ============================================
exports.aiChat = async (req, res) => {
    try {
        const { message, conversationId = null } = req.body;

        if (!message) {
            return res.status(400).json({ error: '消息不能为空' });
        }

        // 获取用户历史订单信息（用于个性化回答）
        const userOrders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('items.product', 'name');

        const context = `
      用户信息：
      - 用户名：${req.user.username}
      - 最近订单数：${userOrders.length}
      
      你是一个专业的客服助手，请根据用户问题提供准确、友好的回答。
      如果涉及订单查询，可以参考用户的历史订单信息。
    `;

        const prompt = `${context}\n\n用户问题：${message}`;
        const aiResponse = await callOpenAI(prompt);

        res.json({
            response: aiResponse,
            conversationId: conversationId || generateConversationId(),
            timestamp: new Date()
        });
    } catch (error) {
        console.error('AI 客服错误:', error);
        res.status(500).json({ error: 'AI 客服响应失败' });
    }
};

// ============================================
// AI 生成报告
// ============================================
exports.generateReport = async (req, res) => {
    try {
        const { reportType, period = '30days' } = req.body;

        // 收集数据
        const salesData = await analyzeSalesData(period);
        const userData = await analyzeUserData(period);
        const productData = await analyzeProductData(period);

        const prompt = `
      请生成一份${period}的${reportType}报告，数据如下：
      
      销售数据：${JSON.stringify(salesData)}
      用户数据：${JSON.stringify(userData)}
      商品数据：${JSON.stringify(productData)}
      
      报告要求：
      1. 执行摘要
      2. 详细数据分析
      3. 趋势解读
      4. 问题诊断
      5. 行动建议
      
      请以专业、结构化的方式呈现，使用 Markdown 格式。
    `;

        const report = await callOpenAI(prompt, { temperature: 0.7, max_tokens: 2000 });

        res.json({
            report,
            metadata: {
                type: reportType,
                period,
                generatedAt: new Date(),
                dataRange: {
                    sales: salesData,
                    users: userData,
                    products: productData
                }
            }
        });
    } catch (error) {
        console.error('生成报告错误:', error);
        res.status(500).json({ error: '生成报告失败' });
    }
};

// ============================================
// AI 预测销量（使用简单的线性回归）
// ============================================
exports.predictSales = async (req, res) => {
    try {
        const { productId, days = 7 } = req.body;

        // 获取历史销售数据
        const historicalData = await Order.aggregate([
            { $match: { 'items.product': mongoose.Types.ObjectId(productId) } },
            { $unwind: '$items' },
            { $match: { 'items.product': mongoose.Types.ObjectId(productId) } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    quantity: { $sum: '$items.quantity' }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 60 } // 最近60天
        ]);

        if (historicalData.length < 7) {
            return res.status(400).json({ error: '历史数据不足，无法预测' });
        }

        // 简单的移动平均预测
        const recentSales = historicalData.slice(-7).map(d => d.quantity);
        const avgSales = recentSales.reduce((a, b) => a + b, 0) / recentSales.length;

        // 计算趋势
        const trend = calculateTrend(historicalData.map(d => d.quantity));

        const predictions = [];
        for (let i = 1; i <= days; i++) {
            const predicted = Math.max(0, Math.round(avgSales + (trend * i)));
            predictions.push({
                date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                predictedQuantity: predicted,
                confidence: calculateConfidence(recentSales)
            });
        }

        res.json({
            productId,
            historicalData,
            predictions,
            avgDailySales: avgSales,
            trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable'
        });
    } catch (error) {
        console.error('销量预测错误:', error);
        res.status(500).json({ error: '销量预测失败' });
    }
};

// ============================================
// AI 商品推荐（基于协同过滤）
// ============================================
exports.recommendProducts = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. 获取用户购买历史
        const userOrders = await Order.find({ user: userId })
            .populate('items.product');

        const purchasedProducts = new Set();
        userOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.product) {
                    purchasedProducts.add(item.product._id.toString());
                }
            });
        });

        // 2. 找到类似用户（购买了相同商品的用户）
        const similarUsers = await Order.aggregate([
            {
                $match: {
                    'items.product': { $in: Array.from(purchasedProducts).map(id => mongoose.Types.ObjectId(id)) },
                    user: { $ne: userId }
                }
            },
            {
                $group: {
                    _id: '$user',
                    commonProducts: { $sum: 1 }
                }
            },
            { $sort: { commonProducts: -1 } },
            { $limit: 10 }
        ]);

        // 3. 获取这些用户购买的其他商品
        const similarUserIds = similarUsers.map(u => u._id);
        const recommendations = await Order.aggregate([
            { $match: { user: { $in: similarUserIds } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    score: { $sum: 1 }
                }
            },
            { $sort: { score: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' }
        ]);

        // 过滤掉已购买的商品
        const filteredRecommendations = recommendations.filter(
            rec => !purchasedProducts.has(rec._id.toString())
        );

        res.json({
            recommendations: filteredRecommendations.map(rec => ({
                product: rec.product,
                score: rec.score,
                reason: '基于相似用户的购买行为'
            }))
        });
    } catch (error) {
        console.error('商品推荐错误:', error);
        res.status(500).json({ error: '商品推荐失败' });
    }
};

// ============================================
// AI 图像识别（商品分类）
// ============================================
exports.imageRecognition = async (req, res) => {
    try {
        const { imageUrl, imageBase64 } = req.body;

        if (!imageUrl && !imageBase64) {
            return res.status(400).json({ error: '请提供图片 URL 或 Base64' });
        }

        // 这里应该调用图像识别 API（如 Google Vision, AWS Rekognition）
        // 示例使用 OpenAI Vision API
        const prompt = "请识别这张图片中的商品，并返回商品类别、品牌、属性等信息。";

        const response = await axios.post(
            OPENAI_API_URL,
            {
                model: 'gpt-4-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            {
                                type: 'image_url',
                                image_url: { url: imageUrl || `data:image/jpeg;base64,${imageBase64}` }
                            }
                        ]
                    }
                ],
                max_tokens: 500
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const result = response.data.choices[0].message.content;

        res.json({
            recognition: result,
            confidence: 0.85 // 示例置信度
        });
    } catch (error) {
        console.error('图像识别错误:', error);
        res.status(500).json({ error: '图像识别失败' });
    }
};

// ============================================
// 辅助函数
// ============================================

// 调用 OpenAI API
async function callOpenAI(prompt, options = {}) {
    const {
        model = 'gpt-4',
        temperature = 0.7,
        max_tokens = 1000
    } = options;

    try {
        const response = await axios.post(
            OPENAI_API_URL,
            {
                model,
                messages: [{ role: 'user', content: prompt }],
                temperature,
                max_tokens
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API 错误:', error.response?.data || error.message);
        throw new Error('AI 服务调用失败');
    }
}

// 获取起始日期
function getStartDate(timeRange) {
    const date = new Date();

    if (timeRange === '7days') {
        date.setDate(date.getDate() - 7);
    } else if (timeRange === '30days') {
        date.setDate(date.getDate() - 30);
    } else if (timeRange === '90days') {
        date.setDate(date.getDate() - 90);
    } else if (timeRange === '1year') {
        date.setFullYear(date.getFullYear() - 1);
    }

    return date;
}

// 计算趋势
function calculateTrend(data) {
    if (data.length < 2) return 0;

    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += data[i];
        sumXY += i * data[i];
        sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
}

// 计算置信度
function calculateConfidence(data) {
    const variance = data.reduce((sum, val) => {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        return sum + Math.pow(val - mean, 2);
    }, 0) / data.length;

    const stdDev = Math.sqrt(variance);
    const cv = stdDev / (data.reduce((a, b) => a + b, 0) / data.length);

    return Math.max(0, Math.min(1, 1 - cv));
}

// 生成对话 ID
function generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}