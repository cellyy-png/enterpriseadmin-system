import { defineStore } from 'pinia'
import { ref } from 'vue'
import { orderAPI } from '@/utils/request'

export const useOrderStore = defineStore('order', () => {
    const orders = ref([])
    const currentOrder = ref(null)

    const fetchOrders = async (params) => {
        try {
            const { data } = await orderAPI.list(params)
            orders.value = data.orders
            return data
        } catch (error) {
            console.error('Fetch orders error:', error)
            throw error
        }
    }

    const fetchOrderById = async (id) => {
        try {
            const { data } = await orderAPI.detail(id)
            currentOrder.value = data.order
            return data.order
        } catch (error) {
            throw error
        }
    }

    const createOrder = async (orderData) => {
        try {
            const { data } = await orderAPI.create(orderData)
            return data
        } catch (error) {
            throw error
        }
    }

    const updateOrderStatus = async (id, status) => {
        try {
            const { data } = await orderAPI.updateStatus(id, status)
            return data
        } catch (error) {
            throw error
        }
    }

    return {
        orders,
        currentOrder,
        fetchOrders,
        fetchOrderById,
        createOrder,
        updateOrderStatus
    }
})