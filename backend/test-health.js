const axios = require('axios');

// 测试配置
const BASE_URL = 'http://localhost:5000/api/health';

// 创建测试函数
async function testHealthCheck() {
  try {
    console.log('开始健康检查...');
    
    // 发送健康检查请求
    const response = await axios.get(BASE_URL);
    
    console.log('=== 健康检查响应 ===');
    console.log('状态码:', response.status);
    console.log('响应头:', response.headers);
    console.log('=== 响应数据 ===');
    console.log(response.data);
    
  } catch (error) {
    console.error('=== 健康检查错误信息 ===');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应头:', error.response.headers);
      console.error('响应数据:', error.response.data);
    } else {
      console.error('错误:', error.message);
    }
  }
}

// 运行测试
testHealthCheck();