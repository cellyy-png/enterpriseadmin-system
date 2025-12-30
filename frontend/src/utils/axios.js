import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const instance = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// 请求拦截器
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('请求发送:', config.method?.toUpperCase(), config.url) // 添加调试信息
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一返回 response.data
instance.interceptors.response.use(
  response => {
    // 直接返回后端的数据部分，统一数据结构
    console.log('响应接收:', response.config.url, response.data) // 添加调试信息
    return response.data
  },
  error => {
    console.error('API请求错误详情:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    }) // 添加详细错误日志
    
    if (error.response) {
      // 特殊处理登录接口的错误
      const isLoginRequest = error.config.url.endsWith('/auth/login');

      switch (error.response.status) {
        case 401:
          // 如果是登录请求返回401，则显示具体的错误信息而不是"登录已过期"
          if (isLoginRequest) {
            const errorMessage = error.response.data?.error || '邮箱或密码错误'
            ElMessage.error(errorMessage);
          } else {
            ElMessage.error('登录已过期，请重新登录');
            localStorage.removeItem('token');
            router.push('/login');
          }
          break
        case 403:
          ElMessage.error('权限不足')
          break
        case 404:
          // 更详细地显示404错误信息
          console.error('API 404错误:', error.config);
          ElMessage.error(`请求的资源不存在: ${error.config.url}`)
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data?.error || error.response.data?.message || '请求失败')
      }
    } else {
      // 网络错误或其他非HTTP错误
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        ElMessage.error('无法连接到服务器，请确保后端服务正在运行');
      } else {
        ElMessage.error('网络错误，请检查网络连接');
      }
    }
    return Promise.reject(error)
  }
)

export default instance