const http = require('http');
const querystring = require('querystring');

// 测试后端服务是否正常运行
const postData = JSON.stringify({
  email: 'admin@example.com',
  password: 'Admin123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🔍 直接测试后端登录接口 http://localhost:5000/api/auth/login');

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers)}`);
  
  res.setEncoding('utf8');
  let responseBody = '';
  
  res.on('data', (chunk) => {
    responseBody += chunk;
  });
  
  res.on('end', () => {
    console.log('响应内容:', responseBody);
    
    if (res.statusCode === 500) {
      console.log('❌ 服务器内部错误，检查后端服务日志');
    } else if (res.statusCode === 200) {
      console.log('✅ 登录请求成功');
    } else {
      console.log(`⚠️  非预期状态码: ${res.statusCode}`);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ 请求错误:', e.message);
  console.log('可能原因:');
  console.log('1. 后端服务未运行在端口 5000');
  console.log('2. 后端服务启动失败');
  console.log('3. 防火墙阻止了连接');
});

req.write(postData);
req.end();