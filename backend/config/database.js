const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        // 如果没有设置 MONGODB_URI 环境变量，则使用内存数据库
        let uri = process.env.MONGODB_URI;
        let mongod;
        
        if (!uri) {
            mongod = await MongoMemoryServer.create();
            uri = mongod.getUri();
        }

        const options = {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            autoIndex: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(uri, options);

        console.log('✓ MongoDB 连接成功');
        
        // 保存 mongod 实例以便后续停止
        if (mongod) {
            mongoose.connection.mongod = mongod;
        }

        // 监听连接事件
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB 连接错误:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB 连接断开');
        });

    } catch (error) {
        console.error('✗ MongoDB 连接失败:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;