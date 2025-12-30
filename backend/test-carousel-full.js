const axios = require('axios');

async function testCarouselAPI() {
  try {
    // 首先登录获取Token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'Admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ 成功获取Token:', token);

    // 设置请求头
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 测试获取轮播图列表
    console.log('\n🔍 正在获取轮播图列表...');
    const listResponse = await axios.get('http://localhost:5000/api/carousels', { headers });
    console.log('✅ 获取轮播图列表成功:', listResponse.data);

    // 创建新的轮播图
    console.log('\n🚀 正在创建新的轮播图...');
    const createData = {
      title: '测试轮播图',
      imageUrl: 'https://via.placeholder.com/800x400',
      linkUrl: 'https://example.com',
      sortOrder: 1,
      status: 'active'
    };
    const createResponse = await axios.post('http://localhost:5000/api/carousels', createData, { headers });
    console.log('✅ 创建轮播图成功:', createResponse.data);

    // 获取更新后的列表
    console.log('\n🔄 正在获取更新后的轮播图列表...');
    const updatedListResponse = await axios.get('http://localhost:5000/api/carousels', { headers });
    console.log('✅ 获取更新后的轮播图列表成功:', updatedListResponse.data);

    // 删除刚刚创建的轮播图
    console.log('\n🗑️ 正在删除轮播图...');
    const createdId = createResponse.data.data._id;
    await axios.delete(`http://localhost:5000/api/carousels/${createdId}`, { headers });
    console.log('✅ 轮播图删除成功');

    // 最后获取列表确认已删除
    console.log('\n✅ 正在确认轮播图已删除...');
    const finalListResponse = await axios.get('http://localhost:5000/api/carousels', { headers });
    console.log('✅ 最终轮播图列表:', finalListResponse.data);
  } catch (error) {
    console.error('❌ API测试失败:', error.response?.data || error.message);
  }
}

testCarouselAPI();