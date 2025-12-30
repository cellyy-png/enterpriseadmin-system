const mongoose = require('mongoose');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/enterprise_admin');

const Carousel = require('./backend/models/Carousel');

async function testModelValidation() {
  try {
    console.log('数据库连接成功');
    
    // 创建一个没有imageUrl的文档进行测试
    console.log('准备创建文档...');
    const testCarousel = new Carousel({
      title: '测试标题',
      linkUrl: 'https://example.com',
      sortOrder: 1,
      status: 'active'
    });
    
    console.log('验证文档...');
    const validation = testCarousel.validateSync();
    if (validation) {
      console.log('验证失败:', validation.errors);
    } else {
      console.log('验证通过');
    }
    
    console.log('准备保存文档...');
    const savedCarousel = await testCarousel.save();
    console.log('文档保存成功:', savedCarousel);
    
    // 清理测试数据
    await Carousel.findByIdAndDelete(savedCarousel._id);
    console.log('测试数据已清理');
  } catch (error) {
    console.error('操作失败:', error.message);
    if (error.name === 'ValidationError') {
      console.log('验证错误详情:', error.errors);
    }
  } finally {
    mongoose.connection.close();
  }
}

// 运行测试
testModelValidation();