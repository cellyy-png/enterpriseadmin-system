import axios from '@/utils/axios'

export const dashboardAPI = {
  // 获取数据概览
  overview: () => axios.get('/dashboard/overview'),

  // 获取销售趋势
  salesTrend: (period) =>
    axios.get('/dashboard/sales-trend', { params: { period } }),

  // 获取用户统计
  userStats: () => axios.get('/dashboard/user-stats'),

  // 获取商品统计
  productStats: () => axios.get('/dashboard/product-stats'),

  // 获取订单统计
  orderStats: () => axios.get('/dashboard/order-stats')
}
