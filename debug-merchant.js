const axios = require('axios');

// 创建一个基础的axios实例用于测试
const apiClient = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 30000
});

let authToken = '';

async function debugMerchantApplications() {
    console.log('开始调试商家申请相关问题...\n');
    
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
    
    // 设置默认认证头
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    // 直接测试数据库查询（绕过控制器populate）
    try {
        console.log('\n2. 测试简单查询商家申请（不populate）');
        // 注意：这里我们直接测试后端逻辑而不是API
        
        // 我们需要检查后端是否有问题，先看看是否能直接访问用户数据
        const usersResponse = await apiClient.get('/api/users');
        console.log('   获取所有用户状态:', usersResponse.status);
        console.log('   用户总数:', usersResponse.data?.pagination?.total || 0);
        
        // 查看是否有pending状态的用户
        console.log('\n3. 查看所有用户状态分布');
        const allUsers = usersResponse.data?.users || [];
        const statusDistribution = {};
        allUsers.forEach(user => {
            statusDistribution[user.status] = (statusDistribution[user.status] || 0) + 1;
        });
        console.log('   状态分布:', statusDistribution);
        
        // 查找特定用户
        const pendingUsers = allUsers.filter(u => u.status === 'pending');
        console.log('   Pending用户数量:', pendingUsers.length);
        if (pendingUsers.length > 0) {
            console.log('   第一个Pending用户:', JSON.stringify(pendingUsers[0], null, 2));
        }
    } catch (error) {
        console.log('   查询用户错误:', error.message);
        if (error.response) {
            console.log('   错误状态:', error.response.status);
            console.log('   错误数据:', JSON.stringify(error.response.data, null, 2));
        }
    }
    
    // 测试商家申请API
    try {
        console.log('\n4. 测试商家申请API');
        const merchantAppsResponse = await apiClient.get('/api/users/merchant-applications');
        console.log('   商家申请API状态:', merchantAppsResponse.status);
        console.log('   返回数据:', JSON.stringify(merchantAppsResponse.data, null, 2));
    } catch (error) {
        console.log('   商家申请API错误:', error.message);
        if (error.response) {
            console.log('   错误状态:', error.response.status);
            console.log('   错误数据:', JSON.stringify(error.response.data, null, 2));
            
            // 尝试更简单的查询
            try {
                console.log('\n5. 尝试直接查询用户API并过滤pending状态');
                const usersResponse = await apiClient.get('/api/users');
                const pendingUsers = (usersResponse.data?.users || []).filter(u => u.status === 'pending');
                console.log('   通过用户API找到的Pending用户数量:', pendingUsers.length);
                if (pendingUsers.length > 0) {
                    console.log('   第一个Pending用户（简化）:', {
                        _id: pendingUsers[0]._id,
                        username: pendingUsers[0].username,
                        email: pendingUsers[0].email,
                        status: pendingUsers[0].status,
                        role: pendingUsers[0].role
                    });
                }
            } catch (simpleError) {
                console.log('   简化查询也失败:', simpleError.message);
            }
        }
    }
}

debugMerchantApplications();