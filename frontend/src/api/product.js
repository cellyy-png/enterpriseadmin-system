import axios from '@/utils/axios'

export const productAPI = {
  // 获取商品列表
  list: (params) => axios.get('/products', { params }),

  // 获取商品详情
  detail: (id) => axios.get(`/products/${id}`),

  // 创建商品
  create: (data) => axios.post('/products', data),

  // 更新商品
  update: (id, data) => axios.put(`/products/${id}`, data),

  // 删除商品
  delete: (id) => axios.delete(`/products/${id}`),

  // 批量删除商品
  batchDelete: (ids) => axios.post('/products/batch-delete', { ids }),

  // 搜索商品
  search: (q) => axios.get('/products/search', { params: { q } }),

  // 上传商品图片
  uploadImages: (id, formData) =>
    axios.post(`/products/${id}/upload-images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // 批量导入商品
  import: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return axios.post('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // 导出商品数据
  export: (params) =>
    axios.get('/products/export', { params, responseType: 'blob' })
}
