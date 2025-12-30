// 商家功能专项测试
const axios = require('axios');

async function merchantTest() {
  try {
    console.log('1. 测试登录...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'Admin123'
    });
    const token = loginResponse.data.token;
    console.log('登录成功');
    
    console.log('2. 测试商家申请列表...');
    const merchantAppsResponse = await axios.get('http://localhost:5000/api/users/merchant-applications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('商家申请列表获取成功:', merchantAppsResponse.data);
    
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

merchantTest();