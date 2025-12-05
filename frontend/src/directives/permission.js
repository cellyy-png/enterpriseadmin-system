import { useUserStore } from '@/stores/user'

export default {
    mounted(el, binding) {
        const { value } = binding
        const userStore = useUserStore()
        const permissions = userStore.user?.role?.permissions || []

        if (value && !hasPermission(permissions, value)) {
            el.parentNode?.removeChild(el)
        }
    }
}

function hasPermission(permissions, required) {
    if (!required) return true
    if (typeof required === 'string') {
        return permissions.some(p => p.resource === required)
    }
    if (Array.isArray(required)) {
        return required.every(req =>
            permissions.some(p => p.resource === req)
        )
    }
    return false
}