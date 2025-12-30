const axios = require('axios');

// 测试前端轮播图上传功能
async function testFrontendUpload() {
  try {
    console.log('正在测试前端轮播图上传功能...');
    
    // 首先登录获取令牌
    console.log('正在登录...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'Admin123'
    });
    
    console.log('登录成功');
    const token = loginResponse.data.token;
    
    // 创建表单数据进行上传
    const formData = new FormData();
    
    // 创建一个虚拟图片文件
    const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    formData.append('image', imageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    formData.append('title', '测试轮播图');
    formData.append('linkUrl', 'http://example.com');
    formData.append('sortOrder', '1');
    formData.append('status', 'active');
    
    console.log('正在上传轮播图...');
    const uploadResponse = await axios.post('http://localhost:5000/api/carousels', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('上传成功:', uploadResponse.data);
    
    // 再次获取轮播图列表
    console.log('\n正在获取轮播图列表...');
    const listResponse = await axios.get('http://localhost:5000/api/carousels', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('轮播图列表:', listResponse.data);
    
  } catch (error) {
    console.error('上传失败:', error.response?.data || error.message);
  }
}

testFrontendUpload();