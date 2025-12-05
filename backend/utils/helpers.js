// 分页辅助
exports.paginate = (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return { skip, limit: parseInt(limit) };
};

// 构建分页响应
exports.paginateResponse = (data, total, page, limit) => {
    return {
        data,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            limit: parseInt(limit)
        }
    };
};

// 日期格式化
exports.formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
};

// 生成订单号
exports.generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `ORD${timestamp}${random}`;
};

// 深度克隆
exports.deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

// 延迟函数
exports.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// 数组去重
exports.unique = (arr) => {
    return [...new Set(arr)];
};