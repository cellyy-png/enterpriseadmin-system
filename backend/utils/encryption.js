const crypto = require('crypto');

// AES加密
exports.encrypt = (text, key = process.env.ENCRYPTION_KEY) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

// AES解密
exports.decrypt = (text, key = process.env.ENCRYPTION_KEY) => {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = parts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// MD5哈希
exports.md5 = (text) => {
    return crypto.createHash('md5').update(text).digest('hex');
};

// SHA256哈希
exports.sha256 = (text) => {
    return crypto.createHash('sha256').update(text).digest('hex');
};

// 生成随机字符串
exports.randomString = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};