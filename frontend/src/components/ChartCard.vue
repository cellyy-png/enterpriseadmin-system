<template>
  <el-card class="chart-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="title">{{ title }}</span>
        <slot name="extra"></slot>
      </div>
    </template>
    <div class="chart-content">
      <slot></slot>
    </div>
  </el-card>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<style lang="scss" scoped>
.chart-card {
  height: 100%;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
    }
  }

  .chart-content {
    width: 100%;
    min-height: 300px;
  }
}
</style>
