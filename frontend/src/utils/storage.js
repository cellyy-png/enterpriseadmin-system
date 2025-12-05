export const storage = {
    get(key) {
        const value = localStorage.getItem(key)
        try {
            return JSON.parse(value)
        } catch {
            return value
        }
    },

    set(key, value) {
        const data = typeof value === 'object' ? JSON.stringify(value) : value
        localStorage.setItem(key, data)
    },

    remove(key) {
        localStorage.removeItem(key)
    },

    clear() {
        localStorage.clear()
    }
}