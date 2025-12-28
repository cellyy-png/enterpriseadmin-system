const axios = require('axios');
const childProcess = require('child_process');

// 测试配置
const BASE_URL = 'http://localhost:5000/api/health';

// 创建测试函数
async function testServerStartup() {
  try {
    console.log('开始测试服务器启动...');
    
    // 尝试启动服务器
    const serverProcess = childProcess.spawn('node', ['app.js'], {
      cwd: __dirname,
      stdio: 'pipe'
    });
    
    // 监听服务器输出
    serverProcess.stdout.on('data', (data) => {
      console.log(`服务器输出: ${data}`);
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(`服务器错误: ${data}`);
    });
    
    // 等待服务器启动
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 检查服务器是否正在运行
    const response = await axios.get(BASE_URL);
    
    console.log('=== 服务器启动响应 ===');
    console.log('状态码:', response.status);
    console.log('响应头:', response.headers);
    console.log('=== 响应数据 ===');
    console.log(response.data);
    
    // 关闭服务器
    serverProcess.kill();
    
  } catch (error) {
    console.error('=== 服务器启动错误信息 ===');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应头:', error.response.headers);
      console.error('响应数据:', error.response.data);
    } else {
      console.error('错误:', error.message);
    }
  }
}

// 运行测试
testServerStartup();