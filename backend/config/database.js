const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(process.env.MONGODB_URI, options);

        console.log('✓ MongoDB 连接成功');

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