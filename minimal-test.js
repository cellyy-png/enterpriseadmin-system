// 最小化测试脚本
const axios = require('axios');

async function minimalTest() {
  try {
    // 直接测试不需要认证的接口
    console.log('测试健康检查接口...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('健康检查响应:', healthResponse.data);
    
    console.log('\n测试登录...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'Admin123'
    });
    console.log('登录成功');
    
    console.log('\n测试用户列表...');
    const usersResponse = await axios.get('http://localhost:5000/api/users', {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    console.log('用户列表获取成功，用户数量:', usersResponse.data.users.length);
    
  } catch (error) {
    console.error('发生错误:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    } else {
      console.error('错误:', error.message);
    }
  }
}

minimalTest();