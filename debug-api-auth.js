const axios = require('axios');

// 创建一个基础的axios实例用于测试
const apiClient = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 30000
});

let authToken = '';

async function testAPIEndpointsWithAuth() {
    console.log('开始测试带认证的API端点...\n');
    
    // 首先登录获取token
    try {
        console.log('1. 登录获取认证令牌');
        const loginResponse = await apiClient.post('/api/auth/login', {
            email: 'admin@example.com',
            password: 'Admin123'
        });
        console.log('   登录成功，状态:', loginResponse.status);
        authToken = loginResponse.data.token;
        console.log('   获取到令牌，长度:', authToken.length);
    } catch (error) {
        console.log('   登录错误:', error.message);
        if (error.response) {
            console.log('   错误状态:', error.response.status);
            console.log('   错误数据:', error.response.data);
        }
        return;
    }
    
    console.log('\n');
    
    // 设置默认认证头
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    // 测试用户端点（带认证）
    try {
        console.log('2. 测试用户端点 /api/users （带认证）');
        const usersResponse = await apiClient.get('/api/users');
        console.log('   响应状态:', usersResponse.status);
        console.log('   用户数量:', usersResponse.data?.users?.length || 0);
    } catch (error) {
        console.log('   错误:', error.message);
        if (error.response) {
            console.log('   错误状态:', error.response.status);
            console.log('   错误数据:', error.response.data);
        }
    }
    
    console.log('\n');
    
    // 测试轮播图端点（带认证）
    try {
        console.log('3. 测试轮播图端点 /api/carousels （带认证）');
        const carouselsResponse = await apiClient.get('/api/carousels');
        console.log('   响应状态:', carouselsResponse.status);
        console.log('   轮播图数量:', carouselsResponse.data?.data?.length || 0);
    } catch (error) {
        console.log('   错误:', error.message);
        if (error.response) {
            console.log('   错误状态:', error.response.status);
            console.log('   错误数据:', error.response.data);
        }
    }
    
    console.log('\n');
    
    // 测试角色端点（带认证）
    try {
        console.log('4. 测试角色端点 /api/users/roles （带认证）');
        const rolesResponse = await apiClient.get('/api/users/roles');
        console.log('   响应状态:', rolesResponse.status);
        console.log('   角色数量:', rolesResponse.data?.roles?.length || 0);
    } catch (error) {
        console.log('   错误:', error.message);
        if (error.response) {
            console.log('   错误状态:', error.response.status);
            console.log('   错误数据:', error.response.data);
        }
    }
    
    console.log('\n');
    
    // 测试产品端点（带认证）
    try {
        console.log('5. 测试产品端点 /api/products （带认证）');
        const productsResponse = await apiClient.get('/api/products');
        console.log('   响应状态:', productsResponse.status);
        console.log('   产品数量:', productsResponse.data?.products?.length || 0);
    } catch (error) {
        console.log('   错误:', error.message);
        if (error.response) {
            console.log('   错误状态:', error.response.status);
            console.log('   错误数据:', error.response.data);
        }
    }
}

testAPIEndpointsWithAuth();