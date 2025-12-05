import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

export function setupRouterGuards(router) {
  // 全局前置守卫
  router.beforeEach((to, from, next) => {
    const userStore = useUserStore()
    const token = localStorage.getItem('token')

    // 设置页面标题
    document.title = to.meta.title
      ? `${to.meta.title} - 企业管理系统`
      : '企业管理系统'

    // 需要认证的路由
    if (to.meta.requiresAuth) {
      if (!token) {
        ElMessage.warning('请先登录')
        next('/login')
        return
      }

      // 权限检查
      if (to.meta.permission) {
        const hasPermission = checkPermission(
          userStore.user,
          to.meta.permission
        )
        if (!hasPermission) {
          ElMessage.error('权限不足')
          next(from.path)
          return
        }
      }
    }

    // 已登录用户访问登录页，跳转到首页
    if (to.path === '/login' && token) {
      next('/')
      return
    }

    next()
  })

  // 全局后置守卫
  router.afterEach((to, from) => {
    // 页面滚动到顶部
    window.scrollTo(0, 0)

    // 记录访问日志
    console.log(`Navigate from ${from.path} to ${to.path}`)
  })

  // 全局错误处理
  router.onError((error) => {
    console.error('Router error:', error)
    ElMessage.error('页面加载失败')
  })
}

function checkPermission(user, permission) {
  if (!user || !user.role) return false

  const permissions = user.role.permissions || []

  // 超级管理员拥有所有权限
  if (user.role.name === 'super_admin') return true

  // 检查是否有对应权限
  return permissions.some(p => p.resource === permission)
}

export default setupRouterGuards
