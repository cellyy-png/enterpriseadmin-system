const axios = require('axios');

async function testBackend() {
    console.log('🔍 测试后端服务...');
    
    try {
        // 测试健康检查端点
        console.log('🏥 检查健康端点...');
        const healthResponse = await axios.get('http://localhost:5000/health');
        console.log('✅ 健康检查:', healthResponse.data);
    } catch (error) {
        console.log('❌ 健康检查失败:', error.message);
        return;
    }

    try {
        // 测试登录端点
        console.log('🔐 测试登录端点...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@example.com',
            password: 'Admin123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ 登录成功:', loginResponse.data);
    } catch (error) {
        console.log('❌ 登录失败:', error.response?.data || error.message);
    }
}

testBackend();