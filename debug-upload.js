const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function debugUpload() {
  try {
    console.log('=== 调试文件上传 ===');
    
    // 1. 登录获取token
    console.log('1. 登录获取认证令牌...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'Admin123'
    });
    
    console.log('登录成功');
    const token = loginResponse.data.token;
    
    // 2. 创建FormData并添加数据
    const formData = new FormData();
    
    // 创建测试图片
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    // 添加文件到FormData
    formData.append('image', imageBuffer, {
      filename: 'test.jpg',
      contentType: 'image/jpeg'
    });
    
    // 添加其他字段
    formData.append('title', '测试轮播图');
    formData.append('linkUrl', 'https://example.com');
    formData.append('sortOrder', '1');
    formData.append('status', 'active');
    
    console.log('2. 准备发送请求...');
    const headers = formData.getHeaders();
    console.log('请求头:', headers);
    
    // 3. 发送请求
    const response = await axios.post('http://localhost:5000/api/carousels', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });
    
    console.log('=== 上传成功 ===');
    console.log('状态码:', response.status);
    console.log('响应数据:', response.data);
    
  } catch (error) {
    console.error('=== 上传失败 ===');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
      console.error('响应头:', error.response.headers);
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

debugUpload();