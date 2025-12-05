import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productAPI } from '@/utils/request'

export const useProductStore = defineStore('product', () => {
    const products = ref([])
    const currentProduct = ref(null)

    const fetchProducts = async (params) => {
        try {
            const { data } = await productAPI.list(params)
            products.value = data.products
            return data
        } catch (error) {
            console.error('Fetch products error:', error)
            throw error
        }
    }

    const fetchProductById = async (id) => {
        try {
            const { data } = await productAPI.detail(id)
            currentProduct.value = data.product
            return data.product
        } catch (error) {
            console.error('Fetch product error:', error)
            throw error
        }
    }

    const createProduct = async (productData) => {
        try {
            const { data } = await productAPI.create(productData)
            return data
        } catch (error) {
            throw error
        }
    }

    const updateProduct = async (id, productData) => {
        try {
            const { data } = await productAPI.update(id, productData)
            return data
        } catch (error) {
            throw error
        }
    }

    const deleteProduct = async (id) => {
        try {
            await productAPI.delete(id)
        } catch (error) {
            throw error
        }
    }

    return {
        products,
        currentProduct,
        fetchProducts,
        fetchProductById,
        createProduct,
        updateProduct,
        deleteProduct
    }
})