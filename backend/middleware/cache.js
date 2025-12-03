exports.cacheMiddleware = (duration = 300) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const redisClient = req.app.get('redisClient');
        const key = `cache:${req.originalUrl}`;

        try {
            const cachedData = await redisClient.get(key);

            if (cachedData) {
                console.log('✓ 命中缓存:', key);
                return res.json(JSON.parse(cachedData));
            }

            // 劫持原始的 res.json 方法
            const originalJson = res.json.bind(res);
            res.json = (data) => {
                // 缓存数据
                redisClient.setex(key, duration, JSON.stringify(data));
                return originalJson(data);
            };

            next();
        } catch (error) {
            console.error('缓存错误:', error);
            next();
        }
    };
};

// 清除缓存
exports.clearCache = (pattern = '*') => {
    return async (req, res, next) => {
        const redisClient = req.app.get('redisClient');

        try {
            const keys = await redisClient.keys(`cache:${pattern}`);
            if (keys.length > 0) {
                await redisClient.del(...keys);
                console.log(`✓ 清除缓存: ${keys.length} 条`);
            }
        } catch (error) {
            console.error('清除缓存错误:', error);
        }

        next();
    };
};