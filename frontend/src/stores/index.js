import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

export { useUserStore } from './user'
export { useAppStore } from './app'
export { useProductStore } from './product'
export { useOrderStore } from './order'