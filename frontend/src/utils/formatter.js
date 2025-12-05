import dayjs from 'dayjs'

// 日期格式化
export const formatDate = (date, format = 'YYYY-MM-DD') => {
    return dayjs(date).format(format)
}

export const formatDateTime = (date) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 相对时间
export const formatRelativeTime = (date) => {
    const now = dayjs()
    const target = dayjs(date)
    const diff = now.diff(target, 'second')

    if (diff < 60) return '刚刚'
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
    if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`
    return formatDate(date)
}

// 货币格式化
export const formatCurrency = (amount, symbol = '¥') => {
    return `${symbol}${Number(amount).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`
}

// 文件大小格式化
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 数字格式化
export const formatNumber = (num) => {
    return Number(num).toLocaleString('zh-CN')
}

// 百分比格式化
export const formatPercent = (num, decimals = 2) => {
    return (Number(num) * 100).toFixed(decimals) + '%'
}