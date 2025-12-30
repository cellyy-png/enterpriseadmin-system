const axios = require('axios');

// 创建一个基础的axios实例用于测试
const apiClient = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 30000
});

async function testAPIEndpoints() {
    console.log('开始测试API端点...\n');
    
    // 测试健康检查端点
    try {
        console.log('1. 测试健康检查端点 /health');
        const healthResponse = await apiClient.get('/health');
        console.log('   响应状态:', healthResponse.status);
        console.log('   响应数据:', JSON.stringify(healthResponse.data, null, 2));
    } catch (error) {
        console.log('   错误:', error.message);
        if (error.response) {
            console.log('   错误状态:', error.response.status);
            console.log('   错误数据:', error.response.data);
        }
    }
    
    console.log('\n');
    
    // 测试认证端点
    try {
        console.log('2. 测试认证端点 /api/auth/login');
        const loginResponse = await apiClient.post('/api/auth/login', {
            email: 'admin@example.com',
            password: 'Admin123'
        });
        console.log('   响应状态:', loginResponse.status);
        console.log('   响应数据:', JSON.stringify(loginResponse.data, null, 2));
    } catch (error) {
        console.log('   错误:', error.message);
        if (error.response) {
            console.log('   错误状态:', error.response.status);
            console.log('   错误数据:', error.response.data);
        }
    }
    
    console.log('\n');
    
    // 测试用户端点（无认证）
    try {
        console.log('3. 测试用户端点 /api/users （无认证）');
        const usersResponse = await apiClient.get('/api/users');
        console.log('   响应状态:', usersResponse.status);
        console.log('   响应数据长度:', usersResponse.data?.length || '无数据');
    } catch (error) {
        console.log('   错误:', error.message);
        if (error.response) {
            console.log('   错误状态:', error.response.status);
            console.log('   错误数据:', error.response.data);
        }
    }
    
    console.log('\n');
    
    // 测试轮播图端点（无认证）
    try {
        console.log('4. 测试轮播图端点 /api/carousels （无认证）');
        const carouselsResponse = await apiClient.get('/api/carousels');
        console.log('   响应状态:', carouselsResponse.status);
        console.log('   响应数据长度:', carouselsResponse.data?.length || '无数据');
    } catch (error) {
        console.log('   错误:', error.message);
        if (error.response) {
            console.log('   错误状态:', error.response.status);
            console.log('   错误数据:', error.response.data);
        }
    }
}

testAPIEndpoints();