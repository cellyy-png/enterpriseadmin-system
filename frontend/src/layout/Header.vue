<template>
  <div class="header-component">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{ currentRoute?.meta?.title }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-actions">
      <el-badge :value="notificationCount" class="notification-badge">
        <el-button :icon="Bell" circle />
      </el-badge>

      <el-dropdown>
        <el-avatar :src="userAvatar" />
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

const currentRoute = computed(() => route)
const userAvatar = computed(() => userStore.user?.avatar)
const notificationCount = computed(() => 3)

const handleLogout = () => {
  userStore.logout()
}
</script>

<style lang="scss" scoped>
.header-component {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;

  .header-actions {
    display: flex;
    align-items: center;
    gap: 20px;

    .notification-badge {
      cursor: pointer;
    }
  }
}
</style>
