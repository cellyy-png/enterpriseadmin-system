import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/utils/axios'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
    const user = ref(null)
    const token = ref(localStorage.getItem('token') || '')

    // 登录
    const login = async (credentials) => {
        try {
            // 在登录前清除可能存在的错误token
            localStorage.removeItem('token')
            token.value = ''
            
            const response = await axios.post('/auth/login', credentials)
            const data = response.data || response // 处理可能的响应格式差异
            token.value = data.token
            user.value = data.user
            localStorage.setItem('token', data.token)
            
            // 确保axios实例能立即使用新的token
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
            
            return { success: true }
        } catch (error) {
            console.error('登录错误详情:', error)
            return {
                success: false,
                message: error.response?.data?.error || error.message || '登录失败'
            }
        }
    }

    // 获取当前用户信息
    const getCurrentUser = async () => {
        try {
            const response = await axios.get('/auth/me')
            const data = response.data || response // 处理可能的响应格式差异
            user.value = data.user
        } catch (error) {
            console.error('获取用户信息错误:', error)
            logout()
        }
    }

    // 退出登录
    const logout = () => {
        user.value = null
        token.value = ''
        localStorage.removeItem('token')
        router.push('/login')
    }

    return {
        user,
        token,
        login,
        getCurrentUser,
        logout
    }
})