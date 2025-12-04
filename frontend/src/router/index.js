import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/',
        component: () => import('@/layout/MainLayout.vue'),
        redirect: '/dashboard',
        meta: { requiresAuth: true },
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/Dashboard.vue'),
                meta: { title: '数据总览', icon: 'DataLine' }
            },
            {
                path: 'users',
                name: 'UserManagement',
                component: () => import('@/views/UserManagement.vue'),
                meta: { title: '用户管理', icon: 'User', permission: 'user' }
            },
            {
                path: 'products',
                name: 'ProductManagement',
                component: () => import('@/views/ProductManagement.vue'),
                meta: { title: '商品管理', icon: 'Goods', permission: 'product' }
            },
            {
                path: 'orders',
                name: 'OrderManagement',
                component: () => import('@/views/OrderManagement.vue'),
                meta: { title: '订单管理', icon: 'ShoppingCart', permission: 'order' }
            },
            {
                path: 'categories',
                name: 'CategoryManagement',
                component: () => import('@/views/CategoryManagement.vue'),
                meta: { title: '分类管理', icon: 'Folder', permission: 'category' }
            },
            {
                path: 'data-screen',
                name: 'DataScreen',
                component: () => import('@/views/DataScreen.vue'),
                meta: { title: '数据大屏', icon: 'Monitor' }
            },
            {
                path: 'ai-assistant',
                name: 'AIAssistant',
                component: () => import('@/views/AIAssistant.vue'),
                meta: { title: 'AI助手', icon: 'ChatDotRound' }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const userStore = useUserStore()
    const token = localStorage.getItem('token')

    if (to.meta.requiresAuth && !token) {
        next('/login')
    } else if (to.path === '/login' && token) {
        next('/')
    } else {
        next()
    }
})

export default router
