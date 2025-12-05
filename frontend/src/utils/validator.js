// 邮箱验证
export const validateEmail = (rule, value, callback) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!value) {
        callback(new Error('请输入邮箱'))
    } else if (!regex.test(value)) {
        callback(new Error('邮箱格式不正确'))
    } else {
        callback()
    }
}

// 手机号验证
export const validatePhone = (rule, value, callback) => {
    const regex = /^1[3-9]\d{9}$/
    if (!value) {
        callback(new Error('请输入手机号'))
    } else if (!regex.test(value)) {
        callback(new Error('手机号格式不正确'))
    } else {
        callback()
    }
}

// 密码强度验证
export const validatePassword = (rule, value, callback) => {
    if (!value) {
        callback(new Error('请输入密码'))
    } else if (value.length < 6) {
        callback(new Error('密码至少6个字符'))
    } else {
        callback()
    }
}

// URL验证
export const validateURL = (rule, value, callback) => {
    try {
        new URL(value)
        callback()
    } catch {
        callback(new Error('URL格式不正确'))
    }
}