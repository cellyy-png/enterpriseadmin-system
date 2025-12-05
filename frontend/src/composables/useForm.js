import { ref, reactive } from 'vue'

export function useForm(initialData = {}) {
    const formRef = ref(null)
    const formData = reactive({ ...initialData })
    const loading = ref(false)

    const resetForm = () => {
        formRef.value?.resetFields()
        Object.assign(formData, initialData)
    }

    const validateForm = async () => {
        if (!formRef.value) return false
        try {
            await formRef.value.validate()
            return true
        } catch (error) {
            return false
        }
    }

    const setFormData = (data) => {
        Object.assign(formData, data)
    }

    const getFormData = () => {
        return { ...formData }
    }

    return {
        formRef,
        formData,
        loading,
        resetForm,
        validateForm,
        setFormData,
        getFormData
    }
}