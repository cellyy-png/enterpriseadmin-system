const net = require('net');

function checkPort(port) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        
        server.listen(port, () => {
            server.close(() => {
                resolve({ port, available: true });
            });
        });
        
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve({ port, available: false });
            } else {
                resolve({ port, available: false, error: err });
            }
        });
    });
}

async function checkAllPorts() {
    console.log('🔍 检查端口可用性...');
    
    const ports = [3000, 5000, 5001];
    const results = [];
    
    for (const port of ports) {
        const result = await checkPort(port);
        results.push(result);
        console.log(`${result.available ? '✅' : '❌'} 端口 ${port} ${result.available ? '可用' : '被占用'}`);
    }
    
    // 如果端口被占用，尝试找出占用进程
    for (const result of results) {
        if (!result.available) {
            console.log(`\n💡 要查看占用端口的进程，请在命令行运行:`);
            console.log(`   netstat -ano | findstr :${result.port}`);
            console.log(`   然后使用: taskkill /PID <进程ID> /F`);
        }
    }
    
    return results;
}

checkAllPorts().then(results => {
    console.log('\n📋 检查完成');
    
    const backendAvailable = results.find(r => r.port === 5000)?.available;
    const frontendAvailable = results.find(r => r.port === 3000)?.available;
    
    if (backendAvailable && frontendAvailable) {
        console.log('✅ 两个端口都可用，可以启动服务');
    } else {
        console.log('❌ 一个或多个端口被占用，需要先释放端口');
    }
}).catch(err => {
    console.error('❌ 检查端口时出错:', err);
});