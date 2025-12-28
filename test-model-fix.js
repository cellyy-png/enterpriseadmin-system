// 简单测试模型验证
const Carousel = require('./backend/models/Carousel');

console.log('测试创建带imageUrl的轮播图...');
try {
  const testCarousel = new Carousel({
    title: '测试标题',
    imageUrl: '/uploads/test.jpg',
    linkUrl: 'https://example.com',
    sortOrder: 1,
    status: 'active'
  });
  
  const validation = testCarousel.validateSync();
  if (validation) {
    console.log('验证失败:', validation.errors);
  } else {
    console.log('验证通过');
  }
} catch (error) {
  console.error('创建失败:', error.message);
}

console.log('测试创建没有imageUrl的轮播图...');
try {
  const testCarousel2 = new Carousel({
    title: '测试标题',
    linkUrl: 'https://example.com',
    sortOrder: 1,
    status: 'active'
  });
  
  const validation = testCarousel2.validateSync();
  if (validation) {
    console.log('验证失败:', validation.errors);
  } else {
    console.log('验证通过');
  }
} catch (error) {
  console.error('创建失败:', error.message);
}