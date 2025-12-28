const axios = require('axios');

async function testMerchantAPI() {
  try {
    // 先登录获取token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'Admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Token:', token);
    
    // 测试商家申请列表接口
    const merchantResponse = await axios.get('http://localhost:5000/api/users/merchant-applications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Merchant applications:', merchantResponse.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    if (error.response && error.response.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testMerchantAPI();