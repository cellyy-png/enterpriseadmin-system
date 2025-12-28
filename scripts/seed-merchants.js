const axios = require('axios');

async function seedMerchantData() {
  try {
    // 创建10个商家入驻申请
    const merchants = [];
    
    // 生成10个商家数据
    for (let i = 1; i <= 10; i++) {
      merchants.push({
        username: `商家${i}`,
        email: `merchant${i}@store.com`,
        password: 'Store123!',
        phone: `1380013800${i % 10}`, // 简单的电话号码生成
        department: `部门${i}`
      });
    }

    console.log(`开始创建${merchants.length}个商家入驻申请...`);
    
    let successCount = 0;
    for (const merchant of merchants) {
      try {
        const response = await axios.post('http://localhost:5000/api/users/merchant-application', merchant);
        console.log(`✅ 成功创建商家: ${merchant.username}`);
        successCount++;
      } catch (error) {
        // 如果商家已经存在，忽略错误
        if (error.response?.data?.message?.includes('已被注册') || 
            error.response?.data?.message?.includes('已存在')) {
          console.log(`⚠️  商家已存在: ${merchant.username}`);
        } else {
          console.error(`❌ 创建商家失败: ${merchant.username}`, error.response?.data || error.message);
        }
      }
    }

    console.log(`商家入驻申请数据创建完成！成功创建: ${successCount}/${merchants.length}`);
  } catch (error) {
    console.error('发生错误:', error.message);
  }
}

// 只有直接运行此脚本时才执行
if (require.main === module) {
  seedMerchantData();
}

module.exports = seedMerchantData;