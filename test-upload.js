const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// 测试轮播图上传功能
async function testUpload() {
  try {
    console.log('正在测试轮播图上传功能...');
    
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
    
    // 创建一个简单的测试图片（1x1像素的透明PNG）
    const imageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    
    // 将图片写入临时文件
    const tempImagePath = './temp-test-image.png';
    fs.writeFileSync(tempImagePath, imageData);
    
    // 添加文件到表单数据
    formData.append('image', fs.createReadStream(tempImagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    // 添加其他字段
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
    
    // 删除临时文件
    fs.unlinkSync(tempImagePath);
    
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
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误详情:', error.response.data);
    }
  }
}

testUpload();