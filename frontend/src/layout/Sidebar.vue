<template>
  <div class="sidebar-component">
    <div class="sidebar-logo">
      <h2>{{ collapsed ? '系统' : '企业管理系统' }}</h2>
    </div>

    <el-menu-item index="/merchant-audit">
      <el-icon><UserFilled /></el-icon> <span>商家入驻审核</span>
    </el-menu-item>

    <el-menu-item index="/carousel-management">
      <el-icon><Picture /></el-icon>
      <span>轮播图管理</span>
    </el-menu-item>
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)

const menuRoutes = computed(() => {
  return router.options.routes
    .find(r => r.path === '/')
    ?.children.filter(c => c.meta?.title) || []
})
</script>

<style lang="scss" scoped>
.sidebar-component {
  height: 100%;
  background: linear-gradient(180deg, #2c3e50 0%, #1a2332 100%);

  .sidebar-logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    h2 {
      color: white;
      font-size: 18px;
      margin: 0;
    }
  }

  .sidebar-menu {
    border: none;
    background: transparent;
  }

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
</style>
