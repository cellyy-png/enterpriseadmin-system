const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动企业管理系统服务...');

// 启动后端服务
console.log('🔧 启动后端服务...');
const backend = spawn('node', ['app.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: ['pipe', 'pipe', 'pipe'] // 捕获输出
});

backend.stdout.on('data', (data) => {
  console.log(`\Backend 输出: ${data}`);
});

backend.stderr.on('data', (data) => {
  console.error(`\Backend 错误: ${data}`);
});

backend.on('close', (code) => {
  console.log(`Backend 进程退出，退出码: ${code}`);
});

// 10秒后启动前端服务
setTimeout(() => {
  console.log('🌐 启动前端服务...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: ['pipe', 'pipe', 'pipe'] // 捕获输出
  });

  frontend.stdout.on('data', (data) => {
    console.log(`\nFrontend 输出: ${data}`);
  });

  frontend.stderr.on('data', (data) => {
    console.error(`\nFrontend 错误: ${data}`);
  });

  frontend.on('close', (code) => {
    console.log(`Frontend 进程退出，退出码: ${code}`);
  });
}, 10000); // 等待10秒让后端先启动

console.log('服务启动命令已发送。请检查控制台输出。');