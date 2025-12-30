const net = require('net');

function testPortBind(port, host = 'localhost') {
    return new Promise((resolve) => {
        const server = net.createServer();
        
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`❌ 端口 ${port} 已被占用`);
                resolve(false);
            } else {
                console.log(`❌ 端口 ${port} 绑定失败:`, err.message);
                resolve(false);
            }
        });
        
        server.once('listening', () => {
            console.log(`✅ 端口 ${port} 可用，测试服务器启动`);
            server.close(() => {
                console.log(`✅ 端口 ${port} 测试完成，已释放`);
                resolve(true);
            });
        });
        
        server.listen(port, host);
    });
}

async function runTests() {
    console.log('🔍 测试端口可用性...\n');
    
    const ports = [3000, 5000];
    
    for (const port of ports) {
        console.log(`测试端口 ${port}...`);
        const available = await testPortBind(port);
        console.log(`端口 ${port} 可用性: ${available ? '是' : '否'}\n`);
    }
    
    console.log('端口测试完成。');
}

runTests().catch(console.error);