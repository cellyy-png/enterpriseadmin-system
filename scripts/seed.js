const mongoose = require('mongoose');
const Product = require('../backend/models/Product');
const Category = require('../backend/models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/admin_system';

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ 数据库连接成功');

    // 获取分类
    const electronics = await Category.findOne({ slug: 'electronics' });

    // 创建示例商品
    const products = [
      {
        name: 'iPhone 15 Pro',
        sku: 'IP15P-001',
        description: '最新款iPhone，搭载A17 Pro芯片',
        price: 7999,
        originalPrice: 8999,
        stock: 100,
        category: electronics._id,
        images: ['https://via.placeholder.com/400'],
        status: 'active'
      },
      {
        name: 'MacBook Pro 14',
        sku: 'MBP14-001',
        description: 'M3 Pro芯片，专业创作利器',
        price: 15999,
        originalPrice: 17999,
        stock: 50,
        category: electronics._id,
        images: ['https://via.placeholder.com/400'],
        status: 'active'
      },
      {
        name: 'AirPods Pro 2',
        sku: 'APP2-001',
        description: '主动降噪无线耳机',
        price: 1899,
        originalPrice: 1999,
        stock: 200,
        category: electronics._id,
        images: ['https://via.placeholder.com/400'],
        status: 'active'
      },
      {
        name: 'iPad Air',
        sku: 'IPA-001',
        description: 'M2芯片，轻薄便携',
        price: 4799,
        originalPrice: 4999,
        stock: 80,
        category: electronics._id,
        images: ['https://via.placeholder.com/400'],
        status: 'active'
      },
      {
        name: 'Apple Watch Series 9',
        sku: 'AWS9-001',
        description: '健康监测智能手表',
        price: 3199,
        originalPrice: 3499,
        stock: 150,
        category: electronics._id,
        images: ['https://via.placeholder.com/400'],
        status: 'active'
      }
    ];

    await Product.insertMany(products);
    console.log('✓ 创建示例商品成功');

    console.log('\n✅ 种子数据创建完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 种子数据创建失败:', error);
    process.exit(1);
  }
}

seedData();
