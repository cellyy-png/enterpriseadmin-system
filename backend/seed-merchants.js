const axios = require('axios');

async function seedMerchantData() {
  try {
    // 创建几个商家入驻申请
    const merchants = [
      {
        username: '数码旗舰店',
        email: 'digital@store.com',
        password: 'Store123!',
        phone: '13800138001',
        department: '数码产品部'
      },
      {
        username: '服装专营店',
        email: 'clothing@store.com',
        password: 'Store123!',
        phone: '13800138002',
        department: '服装事业部'
      },
      {
        username: '家居生活馆',
        email: 'home@store.com',
        password: 'Store123!',
        phone: '13800138003',
        department: '家居用品部'
      }
    ];

    for (const merchant of merchants) {
      try {
        const response = await axios.post('http://localhost:5000/api/users/merchant-application', merchant);
        console.log(`✅ 成功创建商家: ${merchant.username}`, response.data);
      } catch (error) {
        console.error(`❌ 创建商家失败: ${merchant.username}`, error.response?.data || error.message);
      }
    }

    console.log('商家入驻申请数据创建完成！');
  } catch (error) {
    console.error('发生错误:', error.message);
  }
}

seedMerchantData();