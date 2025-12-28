const axios = require('axios');

// 测试配置
const BASE_URL = 'http://localhost:5000';

// 创建测试函数
async function testServerStatus() {
  try {
    console.log('开始测试服务器状态...');
    
    // 发送请求到根路径
    const response = await axios.get(BASE_URL);
    
    console.log('=== 服务器状态响应 ===');
    console.log('状态码:', response.status);
    console.log('响应头:', response.headers);
    console.log('=== 响应数据 ===');
    console.log(response.data);
    
  } catch (error) {
    console.error('=== 服务器状态错误信息 ===');
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
testServerStatus();