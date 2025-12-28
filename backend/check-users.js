const User = require('./models/User');

// 创建测试函数
async function checkUsers() {
  try {
    console.log('开始检查数据库中的用户...');
    
    // 查询所有用户
    const users = await User.find();
    
    console.log('=== 用户列表 ===');
    console.log('总用户数:', users.length);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`用户 ${index + 1}:`);
        console.log('  ID:', user._id);
        console.log('  邮箱:', user.email);
        console.log('  角色:', user.role);
        console.log('  创建时间:', user.createdAt);
        console.log('  更新时间:', user.updatedAt);
        console.log('---');
      });
    } else {
      console.log('没有找到任何用户');
    }
    
  } catch (error) {
    console.error('检查用户失败:', error);
  }
}

// 运行测试
checkUsers();