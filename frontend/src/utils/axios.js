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
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器
instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            // 特殊处理登录接口的错误
            const isLoginRequest = error.config.url.endsWith('/auth/login');
            
            switch (error.response.status) {
                case 401:
                    // 如果是登录请求返回401，则显示具体的错误信息而不是"登录已过期"
                    if (isLoginRequest) {
                        const errorMessage = error.response.data?.error || '邮箱或密码错误';
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
                    ElMessage.error('请求的资源不存在')
                    break
                case 500:
                    ElMessage.error('服务器错误')
                    break
                default:
                    ElMessage.error(error.response.data?.error || '请求失败')
            }
        } else {
            ElMessage.error('网络错误，请检查网络连接')
        }
        return Promise.reject(error)
    }
)

export default instance