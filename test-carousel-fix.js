const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testCarouselFix() {
  try {
    console.log('=== 测试轮播图功能修复 ===');
    
    // 1. 登录获取token
    console.log('1. 登录获取认证令牌...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'Admin123'
    });
    
    console.log('登录成功');
    const token = loginResponse.data.token;
    
    // 2. 创建测试图片（base64格式）
    console.log('2. 准备测试图片...');
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    // 3. 创建FormData并添加数据
    const formData = new FormData();
    formData.append('image', imageBuffer, { 
      filename: 'test.jpg',
      contentType: 'image/jpeg'
    });
    formData.append('title', '测试轮播图');
    formData.append('linkUrl', 'https://example.com');
    formData.append('sortOrder', '1');
    formData.append('status', 'active');
    
    // 4. 发送创建请求
    console.log('3. 发送创建轮播图请求...');
    const response = await axios.post('http://localhost:5000/api/carousels', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });
    
    console.log('=== 响应成功 ===');
    console.log('状态码:', response.status);
    console.log('响应数据:', response.data);
    
    // 5. 获取轮播图列表验证创建结果
    console.log('4. 获取轮播图列表验证...');
    const listResponse = await axios.get('http://localhost:5000/api/carousels', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('轮播图列表数量:', listResponse.data.data.length);
    console.log('最新轮播图:', listResponse.data.data[0]);
    
  } catch (error) {
    console.error('=== 测试失败 ===');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
      console.error('响应头:', error.response.headers);
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

// 运行测试
testCarouselFix();