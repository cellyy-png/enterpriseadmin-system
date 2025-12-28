const axios = require('axios');

async function testCarouselAPI() {
  try {
    // 获取轮播图列表
    console.log('正在获取轮播图列表...');
    const response = await axios.get('http://localhost:5000/api/carousels', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDc4YjJhNjU4ODRjOTIyY2UwOTk2MCIsImlhdCI6MTczNDc2NzQ3OCwiZXhwIjoxNzM1MzcyMjc4fQ.DN5R1fQJzZ8zXz8zXz8zXz8zXz8zXz8zXz8zXz8zXz8'
      }
    });
    
    console.log('获取轮播图列表成功:', response.data);
    
    // 创建新的轮播图
    console.log('正在创建新的轮播图...');
    const newCarousel = {
      title: '测试轮播图',
      imageUrl: 'https://via.placeholder.com/150',
      linkUrl: 'https://example.com',
      sortOrder: 1,
      status: 'active'
    };
    
    const createResponse = await axios.post('http://localhost:5000/api/carousels', newCarousel, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDc4YjJhNjU4ODRjOTIyY2UwOTk2MCIsImlhdCI6MTczNDc2NzQ3OCwiZXhwIjoxNzM1MzcyMjc4fQ.DN5R1fQJzZ8zXz8zXz8zXz8zXz8zXz8zXz8zXz8zXz8'
      }
    });
    
    console.log('创建轮播图成功:', createResponse.data);
    
    // 获取更新后的列表
    console.log('正在获取更新后的轮播图列表...');
    const updatedList = await axios.get('http://localhost:5000/api/carousels', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDc4YjJhNjU4ODRjOTIyY2UwOTk2MCIsImlhdCI6MTczNDc2NzQ3OCwiZXhwIjoxNzM1MzcyMjc4fQ.DN5R1fQJzZ8zXz8zXz8zXz8zXz8zXz8zXz8zXz8zXz8'
      }
    });
    
    console.log('更新后的轮播图列表:', updatedList.data);
  } catch (error) {
    console.error('API测试失败:', error.response?.data || error.message);
  }
}

testCarouselAPI();