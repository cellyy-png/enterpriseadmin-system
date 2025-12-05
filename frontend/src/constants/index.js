// API 基础地址
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 应用名称
export const APP_NAME = '企业管理系统'

// 分页配置
export const PAGE_SIZE = 10
export const PAGE_SIZES = [10, 20, 50, 100]

// Token 存储键
export const TOKEN_KEY = 'token'
export const USER_KEY = 'user'

// 上传文件大小限制（MB）
export const MAX_FILE_SIZE = 10

// 日期格式
export const DATE_FORMAT = 'YYYY-MM-DD'
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

// 请求超时时间（ms）
export const REQUEST_TIMEOUT = 30000
