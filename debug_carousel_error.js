const axios = require('axios');

async function debugCarouselError() {
  try {
    console.log('=== 调试轮播图API错误 ===');
    
    // 1. 登录获取token
    console.log('1. 登录获取认证令牌...');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@example.com',
        password: 'Admin123'
      });
      
      console.log('登录成功，获取到token');
      const token = loginResponse.data.token;
      console.log('Token长度:', token.length);
      
      // 2. 检查用户权限
      console.log('2. 检查当前用户信息...');
      try {
        const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('用户信息获取成功:', {
          id: userResponse.data.user.id,
          email: userResponse.data.user.email,
          role: userResponse.data.user.role,
          permissions: userResponse.data.user.permissions
        });
      } catch (userError) {
        console.error('获取用户信息失败:', userError.response?.data || userError.message);
      }
      
      // 3. 尝试获取轮播图列表
      console.log('3. 尝试获取轮播图列表...');
      try {
        const response = await axios.get('http://localhost:5000/api/carousels', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('轮播图列表获取成功:', response.data);
      } catch (carouselError) {
        console.error('轮播图列表获取失败:', carouselError.response?.data || carouselError.message);
        console.error('状态码:', carouselError.response?.status);
        console.error('错误详情:', carouselError.response?.data);
      }
      
    } catch (loginError) {
      console.error('登录失败:', loginError.response?.data || loginError.message);
      if (loginError.response) {
        console.error('登录响应状态:', loginError.response.status);
        console.error('登录响应数据:', loginError.response.data);
      }
    }
    
  } catch (error) {
    console.error('调试过程失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
      console.error('状态码:', error.response.status);
    }
  }
}

debugCarouselError();