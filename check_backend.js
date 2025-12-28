const http = require('http');

// 检查后端服务是否运行
function checkBackend() {
  console.log('检查后端服务是否运行在 http://localhost:5000...');

  const request = http.get('http://localhost:5000/health', (res) => {
    console.log(`状态码: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('响应内容:', data);
    });
  }).on('error', (err) => {
    console.error('请求失败:', err.message);
    
    // 尝试访问根路径
    console.log('尝试访问根路径...');
    http.get('http://localhost:5000/', (res2) => {
      console.log(`根路径状态码: ${res2.statusCode}`);
      
      let data2 = '';
      res2.on('data', (chunk) => {
        data2 += chunk;
      });
      
      res2.on('end', () => {
        console.log('根路径响应内容长度:', data2.length);
      });
    }).on('error', (err2) => {
      console.error('根路径请求也失败:', err2.message);
    });
  });
}

checkBackend();