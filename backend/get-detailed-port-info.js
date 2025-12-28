const childProcess = require('child_process');

// 创建测试函数
async function getDetailedPortInfo() {
  try {
    console.log('开始获取端口 5000 的详细信息...');
    
    // 使用 netstat 命令获取详细信息
    const result = childProcess.execSync('netstat -ano | findstr :5000', { encoding: 'utf8' });
    
    console.log('=== 端口 5000 详细信息 ===');
    console.log(result);
    
    // 尝试获取所有监听端口的进程
    const allListening = childProcess.execSync('netstat -ano | findstr LISTENING', { encoding: 'utf8' });
    console.log('=== 所有监听端口的进程 ===');
    console.log(allListening);
    
  } catch (error) {
    console.error('获取端口详细信息失败:', error);
  }
}

// 运行测试
getDetailedPortInfo();