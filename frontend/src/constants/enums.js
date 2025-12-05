// 角色枚举
export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    MANAGER: 'manager',
    USER: 'user'
}

// 性别枚举
export const GENDER = {
    MALE: 1,
    FEMALE: 2,
    UNKNOWN: 0
}

export const GENDER_LABELS = {
    0: '未知',
    1: '男',
    2: '女'
}

// 支付方式
export const PAYMENT_METHOD = {
    ALIPAY: 'alipay',
    WECHAT: 'wechat',
    CREDIT_CARD: 'credit_card',
    CASH: 'cash'
}

export const PAYMENT_METHOD_LABELS = {
    alipay: '支付宝',
    wechat: '微信支付',
    credit_card: '信用卡',
    cash: '现金'
}

// HTTP 状态码
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
}
