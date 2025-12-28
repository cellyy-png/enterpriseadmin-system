const axios = require('axios');

async function testLogin() {
    try {
        console.log('测试登录功能...');
        
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'admin@example.com',
            password: 'Admin123'
        });
        
        console.log('登录成功!');
        console.log('响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));
        
        if (response.data.token) {
            console.log('✅ 登录成功，获取到token');
            
            // 测试使用token获取用户信息
            const userResponse = await axios.get('http://localhost:3000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${response.data.token}`
                }
            });
            
            console.log('✅ 获取用户信息成功:', userResponse.data.user.username);
        }
        
    } catch (error) {
        console.error('登录失败:', error.response?.data || error.message);
    }
}

testLogin();