<template>
  <el-container class="main-layout">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarWidth" class="sidebar">
      <div class="sidebar-header">
        <h2 v-if="!appStore.sidebarCollapsed">企业管理系统</h2>
        <h2 v-else>系统</h2>
        <el-button
            :icon="appStore.sidebarCollapsed ? 'Expand' : 'Fold'"
            circle
            @click="appStore.toggleSidebar"
        />
      </div>

      <el-menu
          :default-active="activeMenu"
          :collapse="appStore.sidebarCollapsed"
          class="sidebar-menu"
          router
      >
        <el-menu-item
            v-for="route in menuRoutes"
            :key="route.path"
            :index="route.path"
        >
          <el-icon><component :is="route.meta.icon" /></el-icon>
          <template #title>{{ route.meta.title }}</template>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
        <div class="user-info">
          <el-avatar :src="userStore.user?.avatar" />
          <div v-if="!appStore.sidebarCollapsed" class="user-details">
            <p class="user-name">{{ userStore.user?.username }}</p>
            <p class="user-role">{{ userStore.user?.role?.displayName }}</p>
          </div>
        </div>
      </div>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header class="top-bar">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ currentRoute?.meta?.title }}</el-breadcrumb-item>
        </el-breadcrumb>

        <div class="top-bar-actions">
          <el-badge :value="3" class="notification-badge">
            <el-button :icon="Bell" circle />
          </el-badge>
          <el-dropdown>
            <el-avatar :src="userStore.user?.avatar" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>设置</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const sidebarWidth = computed(() =>
    appStore.sidebarCollapsed ? '64px' : '260px'
)

const activeMenu = computed(() => route.path)

const currentRoute = computed(() => route)

const menuRoutes = computed(() => {
  return router.options.routes
      .find(r => r.path === '/')
      ?.children.filter(c => c.meta?.title) || []
})

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
  })
}
</script>

<style lang="scss" scoped>
.main-layout {
  height: 100vh;
}

.sidebar {
  background: linear-gradient(180deg, #2c3e50 0%, #1a2332 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);

  .sidebar-header {
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    h2 {
      font-size: 18px;
      font-weight: 600;
      white-space: nowrap;
    }
  }

  .sidebar-menu {
    flex: 1;
    border: none;
    background: transparent;

    :deep(.el-menu-item) {
      color: rgba(255, 255, 255, 0.7);

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      &.is-active {
        background: rgba(91, 141, 239, 0.2);
        color: white;
        border-left: 3px solid #5b8def;
      }
    }
  }

  .sidebar-footer {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-details {
        flex: 1;

        .user-name {
          font-weight: 600;
          font-size: 14px;
        }

        .user-role {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 4px;
        }
      }
    }
  }
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  background: white;
  border-bottom: 1px solid #e0e6ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .top-bar-actions {
    display: flex;
    align-items: center;
    gap: 20px;

    .notification-badge {
      cursor: pointer;
    }
  }
}

.main-content {
  background: #f5f7fa;
  padding: 30px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>