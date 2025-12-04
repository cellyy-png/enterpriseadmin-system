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
            const { data } = await axios.post('/auth/login', credentials)
            token.value = data.token
            user.value = data.user
            localStorage.setItem('token', data.token)
            return { success: true }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.error || '登录失败'
            }
        }
    }

    // 获取当前用户信息
    const getCurrentUser = async () => {
        try {
            const { data } = await axios.get('/auth/me')
            user.value = data.user
        } catch (error) {
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