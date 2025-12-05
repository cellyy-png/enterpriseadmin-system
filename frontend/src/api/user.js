import axios from '@/utils/axios'

export const userAPI = {
  // 获取用户列表
  list: (params) => axios.get('/users', { params }),

  // 获取用户详情
  detail: (id) => axios.get(`/users/${id}`),

  // 创建用户
  create: (data) => axios.post('/users', data),

  // 更新用户
  update: (id, data) => axios.put(`/users/${id}`, data),

  // 删除用户
  delete: (id) => axios.delete(`/users/${id}`),

  // 批量删除用户
  batchDelete: (ids) => axios.post('/users/batch-delete', { ids }),

  // 获取用户统计
  stats: (id) => axios.get(`/users/${id}/stats`),

  // 导出用户数据
  export: (params) => axios.get('/users/export', { params, responseType: 'blob' })
}
