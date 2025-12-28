const axios = require('axios');

async function testMerchantAudit() {
  try {
    // 获取管理员Token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'Admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ 成功获取Token:', token);
    
    // 获取商家申请列表
    const listResponse = await axios.get('http://localhost:5000/api/users/merchant-applications', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('🔍 正在获取商家申请列表...');
    if (listResponse.data.success) {
      console.log('✅ 获取商家申请列表成功:', listResponse.data.data.length, '个申请');
    } else {
      console.error('❌ 获取商家申请列表失败:', listResponse.data.message);
    }
    
    // 如果有申请，尝试审核第一个
    if (listResponse.data.data && listResponse.data.data.length > 0) {
      const merchantId = listResponse.data.data[0]._id;
      
      console.log('🚀 正在审核商家申请:', merchantId);
      const auditResponse = await axios.put(`http://localhost:5000/api/users/merchant-audit/${merchantId}`, {
        status: 'active',
        rejectReason: ''
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (auditResponse.data.success) {
        console.log('✅ 商家审核成功:', auditResponse.data.message);
      } else {
        console.error('❌ 商家审核失败:', auditResponse.data.message);
      }
    }
  } catch (error) {
    console.error('API测试失败:', error.response?.data || error.message);
  }
}

testMerchantAudit();