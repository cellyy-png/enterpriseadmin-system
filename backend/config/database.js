const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // 如果没有配置外部 MongoDB 连接串，则启动本地嵌入式数据库
    if (!uri || uri.includes('localhost')) {
      console.log('🔄 正在启动本地嵌入式数据库 (无需安装 MongoDB)...');

      // 1. 确保存储数据的目录存在
      // 数据将保存在 backend/../data/db 目录下
      const dbPath = path.join(__dirname, '../../data/db');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      // 2. 启动带持久化的内存数据库实例
      const mongod = await MongoMemoryServer.create({
        instance: {
          dbPath: dbPath,
          storageEngine: 'wiredTiger' // 使用文件存储引擎
        }
      });

      uri = mongod.getUri();
      console.log(`✅ 本地数据库已启动！数据存储于: ${dbPath}`);
    }

    const options = {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    };

    await mongoose.connect(uri, options);

    console.log('✅ MongoDB 连接成功');

    // 监听连接事件
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB 连接错误:', err);
    });

  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    // 不退出进程，允许重试或在开发模式下继续
  }
};

module.exports = connectDB;
