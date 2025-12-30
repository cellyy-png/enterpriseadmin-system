const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// 测试配置
const BASE_URL = 'http://localhost:5000/api/carousels';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NTE1MDg1OTMxYzg2M2U1MmZkOTQyYiIsImlhdCI6MTc2NjkzNjkyNiwiZXhwIjoxNzY3NTQxNzI2fQ.48Ord79pvie0mgWLjZgVP2ZVM65E3WfL85FeyeXNHa8';

// 创建测试函数
async function testCreateCarousel() {
  try {
    console.log('开始测试创建轮播图...');
    
    // 准备测试数据
    const formData = new FormData();
    
    // 添加表单数据
    formData.append('title', '测试标题');
    formData.append('linkUrl', 'https://example.com');
    formData.append('sortOrder', '1');
    formData.append('status', 'active');
    
    // 发送请求
    const response = await axios.post(BASE_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${TOKEN}`
      },
      timeout: 10000
    });
    
    console.log('=== 响应状态 ===');
    console.log('状态码:', response.status);
    console.log('响应头:', response.headers);
    console.log('=== 响应数据 ===');
    console.log(response.data);
    
  } catch (error) {
    console.error('=== 错误信息 ===');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应头:', error.response.headers);
      console.error('响应数据:', error.response.data);
    } else {
      console.error('错误:', error.message);
    }
  }
}

// 运行测试
testCreateCarousel();