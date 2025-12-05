import axios from '@/utils/axios'

export const orderAPI = {
  // 获取订单列表
  list: (params) => axios.get('/orders', { params }),

  // 获取订单详情
  detail: (id) => axios.get(`/orders/${id}`),

  // 创建订单
  create: (data) => axios.post('/orders', data),

  // 更新订单状态
  updateStatus: (id, status) => axios.put(`/orders/${id}/status`, { status }),

  // 更新支付状态
  updatePaymentStatus: (id, paymentStatus) =>
    axios.put(`/orders/${id}/payment`, { paymentStatus }),

  // 取消订单
  cancel: (id) => axios.delete(`/orders/${id}`),

  // 获取订单追踪信息
  tracking: (id) => axios.get(`/orders/${id}/tracking`),

  // 导出订单数据
  export: (params) => axios.get('/orders/export', { params, responseType: 'blob' })
}
