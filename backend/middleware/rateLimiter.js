const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

exports.createRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15分钟
        max = 100,
        message = '请求过于频繁，请稍后再试',
        skipSuccessfulRequests = false
    } = options;

    return rateLimit({
        windowMs,
        max,
        message: { error: message },
        skipSuccessfulRequests,
        standardHeaders: true,
        legacyHeaders: false,
        // 可选：使用 Redis 存储（多服务器场景）
        // store: new RedisStore({
        //   client: redisClient,
        //   prefix: 'rate_limit:'
        // })
    });
};

// 针对不同端点的限流策略
exports.authLimiter = exports.createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: '登录尝试次数过多，请15分钟后再试',
    skipSuccessfulRequests: true
});

exports.apiLimiter = exports.createRateLimiter({
    windowMs: 1 * 60 * 1000,
    max: 60,
    message: 'API调用频率超限'
});