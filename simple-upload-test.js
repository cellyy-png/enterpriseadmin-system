const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');

async function testUpload() {
  try {
    // 登录
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'Admin123'
    });
    console.log('登录成功');
    const token = loginResponse.data.token;

    // 创建表单数据
    const formData = new FormData();

    // 添加数据
    formData.append('title', '测试轮播图');
    formData.append('linkUrl', 'https://example.com');
    formData.append('sortOrder', '1');
    formData.append('status', 'active');

    // 添加一个虚拟的图片文件
    const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    formData.append('image', imageBuffer, 'test.jpg');

    // 发送请求
    const response = await axios.post('http://localhost:5000/api/carousels', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('上传成功:', response.data);
  } catch (error) {
    console.error('上传失败:', error.response?.data || error.message);
  }
}

testUpload();