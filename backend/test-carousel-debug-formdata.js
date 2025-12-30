const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// 测试配置
const BASE_URL = 'http://localhost:5000/api/carousels';
const TOKEN = 'your-token-here'; // 替换为实际的token

// 创建测试函数
async function testCreateCarouselWithFormData() {
  try {
    console.log('开始使用 FormData 库测试创建轮播图...');
    
    // 准备测试数据
    const formData = new FormData();
    
    // 读取测试图片文件
    const imagePath = path.join(__dirname, '../public/uploads/test.jpg');
    if (!fs.existsSync(imagePath)) {
      console.log('测试图片不存在，创建一个占位图片...');
      // 创建一个简单的测试图片
      const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      fs.writeFileSync(imagePath, testImageContent);
    }
    
    // 添加表单数据
    formData.append('title', 'FormData测试标题');
    formData.append('linkUrl', 'https://example.com');
    formData.append('sortOrder', '1');
    formData.append('status', 'active');
    
    // 添加文件
    formData.append('image', fs.createReadStream(imagePath), 'test.jpg');
    
    // 发送请求
    const response = await axios.post(BASE_URL, formData, {
      headers: {
        ...formData.getHeaders(), // 使用 FormData 提供的正确头部
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
testCreateCarouselWithFormData();