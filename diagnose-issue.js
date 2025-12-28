const fs = require('fs');
const path = require('path');

console.log('🔍 诊断项目问题...');

// 检查关键文件是否存在
const checkFiles = [
    'backend/package.json',
    'backend/app.js',
    'backend/config/database.js',
    'backend/models/User.js',
    'backend/models/Role.js',
    'backend/controllers/authController.js',
    'frontend/package.json',
    'frontend/src/api/auth.js',
    'frontend/vite.config.js'
];

console.log('\n📋 检查关键文件...');
checkFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    const exists = fs.existsSync(fullPath);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// 检查依赖
console.log('\n📦 检查依赖...');
const backendPackage = path.join(__dirname, 'backend/package.json');
const frontendPackage = path.join(__dirname, 'frontend/package.json');

if (fs.existsSync(backendPackage)) {
    const backendDeps = require(backendPackage);
    const requiredDeps = [
        'express', 'mongoose', 'bcryptjs', 'jsonwebtoken', 
        'cors', 'helmet', 'express-rate-limit', 'mongodb-memory-server'
    ];
    
    console.log('后端依赖检查:');
    requiredDeps.forEach(dep => {
        const installed = backendDeps.dependencies && backendDeps.dependencies[dep];
        console.log(`  ${installed ? '✅' : '❌'} ${dep}: ${installed || '未安装'}`);
    });
}

if (fs.existsSync(frontendPackage)) {
    const frontendDeps = require(frontendPackage);
    const requiredFrontendDeps = ['vue', 'vue-router', 'pinia', 'axios', 'element-plus'];
    
    console.log('前端依赖检查:');
    requiredFrontendDeps.forEach(dep => {
        const installed = frontendDeps.dependencies && frontendDeps.dependencies[dep];
        console.log(`  ${installed ? '✅' : '❌'} ${dep}: ${installed || '未安装'}`);
    });
}

// 检查环境
console.log('\n🖥️  检查环境...');
console.log('Node.js 版本:', process.version);
console.log('Node.js 路径:', process.execPath);
console.log('当前工作目录:', __dirname);

// 检查端口占用
const net = require('net');

function checkPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
            server.close();
            resolve(false); // 端口未被占用
        });
        server.on('error', (err) => {
            resolve(true); // 端口被占用
        });
    });
}

async function checkPorts() {
    console.log('\n🔌 检查端口占用...');
    const ports = [3000, 5000, 5001];
    
    for (const port of ports) {
        const isUsed = await checkPort(port);
        console.log(`${isUsed ? '❌' : '✅'} 端口 ${port} ${isUsed ? '已被占用' : '可用'}`);
    }
}

checkPorts().then(() => {
    console.log('\n💡 诊断完成');
    console.log('\n🔧 建议操作:');
    console.log('1. 确保已安装所有依赖: npm install 在项目根目录及 backend/frontend 子目录');
    console.log('2. 确保 MongoDB 内存服务器已安装: npm install mongodb-memory-server');
    console.log('3. 检查防火墙或安全软件是否阻止了 Node.js 进程');
    console.log('4. 尝试以管理员身份运行命令提示符');
    console.log('5. 检查是否有其他进程占用了 3000 或 5000 端口');
});

// 检查目录权限
console.log('\n🔑 检查目录权限...');
try {
    fs.accessSync(__dirname, fs.constants.R_OK | fs.constants.W_OK);
    console.log('✅ 当前目录具有读写权限');
} catch (err) {
    console.log('❌ 当前目录权限不足:', err.message);
}