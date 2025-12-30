const axios = require('axios');

// 测试配置
const BASE_URL = 'http://localhost:5000/api/auth/login';

// 创建测试函数
async function testLogin() {
  try {
    console.log('开始测试登录...');
    
    // 准备登录数据
    const loginData = {
      username: 'admin', // 替换为实际的用户名
      password: 'password' // 替换为实际的密码
    };
    
    // 发送登录请求
    const response = await axios.post(BASE_URL, loginData);
    
    console.log('=== 登录响应 ===');
    console.log('状态码:', response.status);
    console.log('响应头:', response.headers);
    console.log('=== 响应数据 ===');
    console.log(response.data);
    
    if (response.data && response.data.token) {
      console.log('成功获取Token:', response.data.token);
      return response.data.token;
    } else {
      console.error('无法获取Token');
      return null;
    }
    
  } catch (error) {
    console.error('=== 登录错误信息 ===');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应头:', error.response.headers);
      console.error('响应数据:', error.response.data);
    } else {
      console.error('错误:', error.message);
    }
    return null;
  }
}

// 运行测试
testLogin();