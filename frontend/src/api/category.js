import axios from '@/utils/axios'

export const categoryAPI = {
  // 获取分类列表
  list: (params) => axios.get('/categories', { params }),

  // 获取分类树
  tree: () => axios.get('/categories/tree'),

  // 获取分类详情
  detail: (id) => axios.get(`/categories/${id}`),

  // 创建分类
  create: (data) => axios.post('/categories', data),

  // 更新分类
  update: (id, data) => axios.put(`/categories/${id}`, data),

  // 删除分类
  delete: (id) => axios.delete(`/categories/${id}`)
}
