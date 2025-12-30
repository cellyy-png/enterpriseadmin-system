const axios = require('axios');

// 测试 API
async function testAPI() {
  try {
    console.log('正在测试轮播图 API...');
    
    // 首先尝试获取轮播图列表（这会失败，因为需要认证）
    try {
      const listResponse = await axios.get('http://localhost:5000/api/carousels');
      console.log('轮播图列表:', listResponse.data);
    } catch (error) {
      console.log('获取轮播图列表失败（需要认证）:', error.response?.data || error.message);
    }
    
    // 尝试登录
    console.log('\n正在尝试登录...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'Admin123'
    });
    
    console.log('登录成功:', loginResponse.data);
    const token = loginResponse.data.token;
    
    // 使用令牌获取轮播图列表
    console.log('\n正在使用令牌获取轮播图列表...');
    const authListResponse = await axios.get('http://localhost:5000/api/carousels', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('认证后的轮播图列表:', authListResponse.data);
    
  } catch (error) {
    console.error('API 测试失败:', error.response?.data || error.message);
  }
}

testAPI();