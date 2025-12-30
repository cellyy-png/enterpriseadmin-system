const axios = require('axios');

async function testMerchantAPI() {
  try {
    console.log('开始测试商家入驻审核功能...');
    
    // 先登录获取token
    console.log('1. 正在登录...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'Admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('登录成功，获得token:', token.substring(0, 20) + '...');
    
    // 测试商家申请列表接口
    console.log('2. 正在调用商家申请列表接口...');
    const merchantResponse = await axios.get('http://localhost:5000/api/users/merchant-applications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('商家申请列表接口调用成功:');
    console.log(JSON.stringify(merchantResponse.data, null, 2));
  } catch (error) {
    console.error('发生错误:');
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误信息:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('网络错误或其他问题:', error.message);
    }
  }
}

testMerchantAPI();