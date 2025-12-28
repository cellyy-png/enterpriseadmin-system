// 测试前端上传功能
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testFrontendUpload() {
  try {
    console.log('正在测试前端上传功能...');
    
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

testFrontendUpload();

const puppeteer = require('puppeteer');

(async () => {
  // 启动浏览器
  const browser = await puppeteer.launch({ headless: false }); // 设置为 false 以便看到浏览器操作
  const page = await browser.newPage();
  
  try {
    // 访问前端页面
    console.log('正在访问前端页面...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // 等待页面加载
    await page.waitForSelector('h1, .app-container, .el-card');
    
    // 尝试登录（如果需要）
    console.log('检查是否需要登录...');
    if (await page.$('input[type="email"], input[type="text"]')) {
      console.log('检测到登录页面，尝试登录...');
      await page.type('input[type="email"], input[name="email"]', 'admin@example.com');
      await page.type('input[type="password"]', 'Admin123');
      await page.click('button[type="submit"], .login-btn');
      
      // 等待登录完成
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }
    
    // 导航到轮播图管理页面（如果当前不在该页面）
    console.log('导航到轮播图管理页面...');
    await page.goto('http://localhost:3000/#/carousel', { waitUntil: 'networkidle2' });
    
    // 等待页面加载
    await page.waitForSelector('.app-container, .el-card');
    
    // 点击新增轮播图按钮
    console.log('点击新增轮播图按钮...');
    await page.click('button:has-text("新增轮播图")');
    
    // 等待对话框出现
    await page.waitForSelector('.el-dialog');
    
    // 输入标题
    console.log('输入标题...');
    await page.type('input[placeholder="请输入标题"]', '测试轮播图');
    
    // 上传图片（这里使用虚拟图片）
    console.log('上传图片...');
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      // 创建一个临时图片文件
      const fs = require('fs');
      const imageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
      const tempImagePath = './temp-test-upload.png';
      fs.writeFileSync(tempImagePath, imageData);
      
      await fileInput.uploadFile(tempImagePath);
      
      // 删除临时文件
      fs.unlinkSync(tempImagePath);
    }
    
    // 输入链接
    await page.type('input[placeholder="点击后跳转的地址"]', 'http://example.com');
    
    // 设置排序
    await page.type('input[type="number"]', '1');
    
    // 点击确定按钮
    console.log('点击确定按钮...');
    await page.click('button:has-text("确定")');
    
    // 等待上传完成
    await page.waitForSelector('.el-message', { timeout: 5000 });
    
    console.log('上传成功！');
    
    // 等待列表刷新
    await page.waitForTimeout(2000);
    
    // 检查新添加的轮播图是否出现在表格中
    const carouselExists = await page.$eval('td:has-text("测试轮播图")', element => !!element);
    if (carouselExists) {
      console.log('✅ 轮播图成功显示在表格中！');
    } else {
      console.log('❌ 轮播图未在表格中显示');
    }
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  } finally {
    // 关闭浏览器
    await browser.close();
  }
})();