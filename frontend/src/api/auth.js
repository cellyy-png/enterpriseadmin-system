import axios from '@/utils/axios'

export const authAPI = {
  // 用户注册
  register: (data) => axios.post('/auth/register', data),

  // 用户登录
  login: (data) => axios.post('/auth/login', data),

  // 退出登录
  logout: () => axios.post('/auth/logout'),

  // 获取当前用户信息
  getCurrentUser: () => axios.get('/auth/me'),

  // 刷新Token
  refreshToken: () => axios.post('/auth/refresh-token'),

  // 修改密码
  changePassword: (data) => axios.post('/auth/change-password', data),

  // 忘记密码
  forgotPassword: (email) => axios.post('/auth/forgot-password', { email }),

  // 重置密码
  resetPassword: (token, password) =>
    axios.post('/auth/reset-password', { token, password })
}
