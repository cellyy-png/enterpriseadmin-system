import axios from '@/utils/axios'

export const aiAPI = {
  // AI对话
  chat: (message) => axios.post('/ai/chat', { message }),

  // 数据分析
  analyzeData: (dataType, timeRange) =>
    axios.post('/ai/analyze-data', { dataType, timeRange }),

  // 生成报告
  generateReport: (reportType, period) =>
    axios.post('/ai/generate-report', { reportType, period }),

  // 销量预测
  predictSales: (productId, days) =>
    axios.post('/ai/predict-sales', { productId, days }),

  // 商品推荐
  recommendProducts: () => axios.post('/ai/recommend-products'),

  // 图像识别
  imageRecognition: (imageUrl, imageBase64) =>
    axios.post('/ai/image-recognition', { imageUrl, imageBase64 })
}
