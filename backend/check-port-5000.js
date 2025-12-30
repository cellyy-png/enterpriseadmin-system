const axios = require('axios');
const childProcess = require('child_process');

// 创建测试函数
async function checkPortUsage() {
  try {
    console.log('开始检查端口 5000 的使用情况...');
    
    // 使用 netstat 命令检查端口使用情况
    const result = childProcess.execSync('netstat -ano | findstr :5000', { encoding: 'utf8' });
    
    console.log('=== 端口 5000 使用情况 ===');
    console.log(result);
    
    // 如果有进程在使用端口，尝试获取进程信息
    if (result.trim()) {
      const pidMatch = result.match(/(\d+)$/);
      if (pidMatch) {
        const pid = pidMatch[1];
        console.log(`发现进程 ID: ${pid}`);
        
        // 获取进程详细信息
        const processInfo = childProcess.execSync(`tasklist /FI "PID eq ${pid}"`, { encoding: 'utf8' });
        console.log('=== 进程详细信息 ===');
        console.log(processInfo);
      }
    } else {
      console.log('端口 5000 当前未被使用');
    }
    
  } catch (error) {
    console.error('检查端口使用情况失败:', error);
  }
}

// 运行测试
checkPortUsage();