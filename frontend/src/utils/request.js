import axios from './axios'

export const userAPI = {
    list: (params) => axios.get('/users', { params }),
    detail: (id) => axios.get(`/users/${id}`),
    create: (data) => axios.post('/users', data),
    update: (id, data) => axios.put(`/users/${id}`, data),
    delete: (id) => axios.delete(`/users/${id}`)
}

export const productAPI = {
    list: (params) => axios.get('/products', { params }),
    detail: (id) => axios.get(`/products/${id}`),
    create: (data) => axios.post('/products', data),
    update: (id, data) => axios.put(`/products/${id}`, data),
    delete: (id) => axios.delete(`/products/${id}`)
}

export const orderAPI = {
    list: (params) => axios.get('/orders', { params }),
    detail: (id) => axios.get(`/orders/${id}`),
    create: (data) => axios.post('/orders', data),
    updateStatus: (id, status) => axios.put(`/orders/${id}/status`, { status }),
    cancel: (id) => axios.delete(`/orders/${id}`)
}

export const categoryAPI = {
    list: (params) => axios.get('/categories', { params }),
    tree: () => axios.get('/categories/tree'),
    create: (data) => axios.post('/categories', data),
    update: (id, data) => axios.put(`/categories/${id}`, data),
    delete: (id) => axios.delete(`/categories/${id}`)
}

export const dashboardAPI = {
    overview: () => axios.get('/dashboard/overview'),
    salesTrend: (period) => axios.get('/dashboard/sales-trend', { params: { period } }),
    userStats: () => axios.get('/dashboard/user-stats'),
    productStats: () => axios.get('/dashboard/product-stats')
}

export const aiAPI = {
    chat: (message) => axios.post('/ai/chat', { message }),
    analyzeData: (dataType, timeRange) => axios.post('/ai/analyze-data', { dataType, timeRange }),
    generateReport: (reportType, period) => axios.post('/ai/generate-report', { reportType, period }),
    predictSales: (productId, days) => axios.post('/ai/predict-sales', { productId, days }),
    recommendProducts: () => axios.post('/ai/recommend-products')
}
