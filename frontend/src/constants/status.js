// 用户状态
export const USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
}

export const USER_STATUS_LABELS = {
    active: '激活',
    inactive: '停用',
    suspended: '封禁'
}

// 订单状态
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
}

export const ORDER_STATUS_LABELS = {
    pending: '待处理',
    confirmed: '已确认',
    processing: '处理中',
    shipped: '已发货',
    delivered: '已送达',
    cancelled: '已取消'
}

// 支付状态
export const PAYMENT_STATUS = {
    UNPAID: 'unpaid',
    PAID: 'paid',
    REFUNDED: 'refunded'
}

export const PAYMENT_STATUS_LABELS = {
    unpaid: '未支付',
    paid: '已支付',
    refunded: '已退款'
}

// 商品状态
export const PRODUCT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    OUT_OF_STOCK: 'out_of_stock'
}

export const PRODUCT_STATUS_LABELS = {
    active: '上架',
    inactive: '下架',
    out_of_stock: '缺货'
}