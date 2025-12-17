const axios = require('axios');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');

// 读取环境变量
// 默认回退到 SiliconFlow 地址，防止环境变量读取失败
const AI_API_URL = process.env.AI_API_URL || 'https://api.siliconflow.cn/v1/chat/completions';
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'moonshotai/Kimi-K2-Instruct-0905';

// ============================================
// 核心：通用 AI 调用函数 (联网版)
// ============================================
async function callAI(prompt, options = {}) {
  const { systemPrompt, max_tokens = 2000, temperature = 0.7 } = options;

  if (!AI_API_KEY) {
    throw new Error('未配置 AI_API_KEY，请检查 backend/.env 文件');
  }

  try {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    console.log(`📡 [Kimi] 正在请求模型: ${AI_MODEL}...`);

    const response = await axios.post(
      AI_API_URL,
      {
        model: AI_MODEL,
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60秒超时
      }
    );

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI 返回了空内容');
    }
    return content;

  } catch (error) {
    console.error('❌ AI API 调用失败:', error.response?.data || error.message);

    let clientMsg = 'AI 服务暂时不可用';
    if (error.response) {
      const status = error.response.status;
      if (status === 401) clientMsg = 'API Key 无效，请检查 .env 配置';
      else if (status === 402) clientMsg = '账户余额不足';
      else if (status === 429) clientMsg = '请求过于频繁，请稍后再试';
      else if (error.response.data?.error?.message) clientMsg = `AI 报错: ${error.response.data.error.message}`;
    }
    throw new Error(clientMsg);
  }
}

// ============================================
// 业务功能 1: AI 数据分析
// ============================================
exports.analyzeData = async (req, res) => {
  try {
    const { dataType, timeRange = '30days' } = req.body;

    let data;
    switch (dataType) {
      case 'sales': data = await analyzeSalesData(timeRange); break;
      case 'users': data = await analyzeUserData(timeRange); break;
      case 'products': data = await analyzeProductData(timeRange); break;
      default: return res.status(400).json({ error: '不支持的数据类型' });
    }

    const prompt = `
你是一位专业的数据分析专家。请根据以下 JSON 格式的真实业务数据，写一份简短的分析报告（使用 Markdown 格式）。
数据类型: ${dataType}
数据内容: ${JSON.stringify(data)}

请包含：
1. 核心指标解读
2. 趋势判断
3. 给管理层的简短建议
`;

    const aiResponse = await callAI(prompt, { temperature: 0.3 });

    res.json({
      rawData: data,
      analysis: aiResponse,
      generatedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// 业务功能 2: 智能客服对话
// ============================================
exports.aiChat = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    if (!message) return res.status(400).json({ error: '消息不能为空' });

    const userContext = req.user ? `当前用户: ${req.user.username}` : '';

    // Kimi 的 System Prompt 设定
    const systemPrompt = `
你是一个企业后台管理系统的智能助手 (基于 Kimi 模型)。
请用专业、简洁、有帮助的中文回答用户关于系统管理或数据运营的问题。
${userContext}
`;

    const aiResponse = await callAI(message, { systemPrompt });

    res.json({
      response: aiResponse,
      conversationId: conversationId || Date.now().toString(),
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// 业务功能 3: 数据统计
// ============================================
exports.getDataStatistics = async (req, res) => {
  try {
    // 获取各类统计数据
    const [totalUsers, totalOrders, totalSales, totalProducts] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      Product.countDocuments({ status: 'active' })
    ]);

    // 计算平均订单金额
    const avgOrderValue = totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0;

    res.json({
      statistics: {
        totalUsers,
        totalOrders,
        totalSales,
        totalProducts,
        avgOrderValue
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// 业务功能 4: 商品推荐
// ============================================
exports.recommendProducts = async (req, res) => {
  try {
    const topProducts = await Product.find({ status: 'active' })
      .sort({ sales: -1 })
      .limit(5)
      .select('name price category sales')
      .populate('category', 'name');

    const pStr = topProducts.map(p => `${p.name}(销量${p.sales})`).join('; ');
    const prompt = `请为以下热销商品写一句简短、吸引人的营销推荐语（50字以内）: ${pStr}`;
    const reason = await callAI(prompt, { max_tokens: 150 });

    res.json({
      recommendations: topProducts.slice(0, 3).map(p => ({
        product: p,
        reason: reason || "年度热销推荐"
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// 图像识别 (暂不支持)
// ============================================
exports.imageRecognition = async (req, res) => {
  res.json({ recognition: "当前 Kimi 模型暂不支持图像识别。", confidence: 0 });
};

// ============================================
// 辅助函数 (数据库查询)
// ============================================
function getStartDate(timeRange) {
  const date = new Date();
  if (timeRange === '7days') date.setDate(date.getDate() - 7);
  else if (timeRange === 'quarter') date.setMonth(date.getMonth() - 3);
  else date.setDate(date.getDate() - 30);
  return date;
}

async function analyzeSalesData(timeRange) {
  const startDate = getStartDate(timeRange);
  const result = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
  ]);
  return { totalRevenue: result[0]?.total || 0, orderCount: result[0]?.count || 0 };
}

async function analyzeUserData(timeRange) {
  const startDate = getStartDate(timeRange);
  const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
  return { newUsers };
}

async function analyzeProductData(timeRange) {
  return { activeProducts: await Product.countDocuments({ status: 'active' }) };
}
