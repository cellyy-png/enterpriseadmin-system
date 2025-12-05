// 邮箱验证
exports.isEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// 手机号验证
exports.isPhone = (phone) => {
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phone);
};

// URL验证
exports.isURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// 密码强度验证
exports.isStrongPassword = (password) => {
    // 至少8位，包含大小写字母、数字和特殊字符
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};

// 身份证验证
exports.isIDCard = (idCard) => {
    const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return regex.test(idCard);
};

// MongoDB ObjectId验证
exports.isObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};
