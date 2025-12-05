import { ref, reactive } from 'vue'

export function useTable(fetchFn) {
    const loading = ref(false)
    const data = ref([])
    const pagination = reactive({
        page: 1,
        limit: 10,
        total: 0
    })

    const fetchData = async (params = {}) => {
        loading.value = true
        try {
            const response = await fetchFn({
                page: pagination.page,
                limit: pagination.limit,
                ...params
            })
            data.value = response.data
            if (response.pagination) {
                Object.assign(pagination, response.pagination)
            }
        } catch (error) {
            console.error('Fetch data error:', error)
        } finally {
            loading.value = false
        }
    }

    const handlePageChange = (page) => {
        pagination.page = page
        fetchData()
    }

    const handleSizeChange = (size) => {
        pagination.limit = size
        pagination.page = 1
        fetchData()
    }

    const refresh = () => {
        fetchData()
    }

    const reset = () => {
        pagination.page = 1
        pagination.limit = 10
        fetchData()
    }

    return {
        loading,
        data,
        pagination,
        fetchData,
        handlePageChange,
        handleSizeChange,
        refresh,
        reset
    }
}