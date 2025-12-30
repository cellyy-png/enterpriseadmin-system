const mongoose = require('mongoose');

let mongod; // 用于保存内存数据库实例

const connectDB = async () => {
  try {
    // 使用本地 MongoDB 实例，如果未运行则使用内存数据库
    let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/enterpriseadmin';
    
    const options = {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    };

    await mongoose.connect(uri, options);
    console.log('✅ MongoDB 连接成功');
    console.log('📊 使用数据库:', uri);
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    console.log('🔄 尝试使用内存数据库...');
    
    // 如果连接失败，使用内存数据库
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      
      const memOptions = {
        serverSelectionTimeoutMS: 5000,
        autoIndex: true,
      };
      
      await mongoose.connect(uri, memOptions);
      console.log('✅ 内存数据库连接成功');
      console.log('📊 使用内存数据库:', uri);
    } catch (memError) {
      console.error('❌ 内存数据库连接失败:', memError.message);
      console.error('详细错误:', memError);
      throw memError; // 重新抛出错误，使服务器启动失败更明显
    }
  }

  // 监听连接事件
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB 连接错误:', err);
  });

  // 在进程退出时清理内存数据库
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
    process.exit(0);
  });
};

module.exports = connectDB;