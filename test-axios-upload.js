// 测试前端上传逻辑
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testAxiosUpload() {
  try {
    console.log('开始测试前端上传逻辑...');

    // 登录获取token
    console.log('正在登录...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'Admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('登录成功');

    // 准备测试图片
    const imageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    const tempImagePath = './temp-test-image.png';
    fs.writeFileSync(tempImagePath, imageData);

    // 模拟前端上传逻辑
    const formData = new FormData();
    formData.append('image', fs.createReadStream(tempImagePath), {
      filename: 'test-axios-upload.png',
      contentType: 'image/png'
    });
    formData.append('title', 'Axios测试轮播图');
    formData.append('linkUrl', 'http://axios-test.com');
    formData.append('sortOrder', '2');
    formData.append('status', 'active');

    console.log('正在上传...');
    const response = await axios.post('http://localhost:5000/api/carousels', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('上传成功:', response.data);

    // 清理临时文件
    fs.unlinkSync(tempImagePath);

    // 获取列表验证
    const listResponse = await axios.get('http://localhost:5000/api/carousels', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('轮播图列表数量:', listResponse.data.data.length);
    console.log('最新轮播图:', listResponse.data.data[0]);

  } catch (error) {
    console.error('测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
      console.error('响应状态:', error.response.status);
    }
  }
}

testAxiosUpload();