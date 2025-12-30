// 测试轮播图前端功能的脚本
const puppeteer = require('puppeteer');

async function testCarouselFrontend() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 访问前端页面
    await page.goto('http://localhost:3004');
    
    // 等待页面加载
    await page.waitForSelector('input[placeholder="请输入邮箱"]');
    
    // 登录
    await page.type('input[placeholder="请输入邮箱"]', 'admin@example.com');
    await page.type('input[type="password"]', 'Admin123');
    await page.click('.login-button');
    
    // 等待登录完成
    await page.waitForNavigation();
    
    // 导航到轮播图管理页面
    await page.waitForSelector('a[href="#/carousel-management"]');
    await page.click('a[href="#/carousel-management"]');
    
    // 等待轮播图管理页面加载
    await page.waitForSelector('.carousel-management');
    
    console.log('轮播图管理页面加载成功');
    
    // 检查页面元素
    const title = await page.$eval('h1', el => el.textContent);
    console.log('页面标题:', title);
    
    // 检查是否存在轮播图列表
    const carouselItems = await page.$$('.carousel-image');
    console.log('发现轮播图数量:', carouselItems.length);
    
    console.log('轮播图管理功能测试完成');
    
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    await browser.close();
  }
}

// 仅在直接运行此文件时执行测试
if (require.main === module) {
  testCarouselFrontend().catch(console.error);
}

module.exports = { testCarouselFrontend };