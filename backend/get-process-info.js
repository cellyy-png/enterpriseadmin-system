const childProcess = require('child_process');

// 创建测试函数
async function getProcessInfo() {
  try {
    console.log('开始获取进程 32912 的详细信息...');
    
    // 获取进程详细信息
    const processInfo = childProcess.execSync('tasklist /FI "PID eq 32912"', { encoding: 'utf8' });
    
    console.log('=== 进程详细信息 ===');
    console.log(processInfo);
    
  } catch (error) {
    console.error('获取进程信息失败:', error);
  }
}

// 运行测试
getProcessInfo();