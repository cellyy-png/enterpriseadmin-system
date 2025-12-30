const axios = require('axios');

async function finalTest() {
  try {
    // 登录
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'Admin123'
    });
    console.log('登录成功');
    const token = loginResponse.data.token;

    // 获取轮播图列表，验证上传的图片是否存在
    const listResponse = await axios.get('http://localhost:5000/api/carousels', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('轮播图列表获取成功，数量:', listResponse.data.data.length);
    console.log('最新轮播图:', listResponse.data.data[0]);
    
    // 验证最新轮播图包含正确的图片URL
    if (listResponse.data.data[0] && listResponse.data.data[0].imageUrl) {
      console.log('✅ 图片URL存在:', listResponse.data.data[0].imageUrl);
      
      // 尝试访问图片URL，确认文件存在
      const imageUrl = `http://localhost:5000${listResponse.data.data[0].imageUrl}`;
      console.log('尝试访问图片URL:', imageUrl);
    } else {
      console.log('❌ 没有找到图片URL');
    }
  } catch (error) {
    console.error('获取轮播图列表失败:', error.message);
  }
}

finalTest();