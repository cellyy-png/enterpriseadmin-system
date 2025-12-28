// 测试数据库连接
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

async function testDBConnection() {
    console.log('🔍 测试数据库连接...');
    
    try {
        console.log('🔧 启动内存数据库...');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        
        console.log('📊 数据库URI:', uri);
        
        console.log('🔌 连接到数据库...');
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            autoIndex: true,
        });
        
        console.log('✅ 数据库连接成功');
        
        // 测试数据操作
        console.log('📝 测试数据操作...');
        
        // 定义一个简单的模型
        const testSchema = new mongoose.Schema({
            name: String,
            createdAt: { type: Date, default: Date.now }
        });
        
        const TestModel = mongoose.model('Test', testSchema);
        
        // 创建测试数据
        const testData = new TestModel({ name: 'test' });
        await testData.save();
        
        console.log('✅ 数据保存成功');
        
        // 查询测试数据
        const found = await TestModel.findOne({ name: 'test' });
        console.log('✅ 数据查询成功:', found.name);
        
        // 断开连接
        await mongoose.disconnect();
        await mongod.stop();
        
        console.log('✅ 数据库测试完成');
    } catch (error) {
        console.error('❌ 数据库测试失败:', error.message);
        console.error('详细错误:', error);
    }
}

testDBConnection();