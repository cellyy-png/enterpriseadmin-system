<template>
  <div class="metric-card" :style="{ borderLeftColor: color }">
    <div class="metric-icon" :style="{ background: color }">
      <el-icon size="32"><component :is="icon" /></el-icon>
    </div>
    <div class="metric-info">
      <p class="metric-title">{{ title }}</p>
      <h2 class="metric-value">{{ value }}</h2>
      <p class="metric-change" :style="{ color }">{{ change }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  change: String,
  icon: String,
  color: String
})
</script>

<style lang="scss" scoped>
.metric-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  .metric-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .metric-title {
    color: #7f8c8d;
    font-size: 14px;
    margin-bottom: 5px;
  }

  .metric-value {
    font-size: 32px;
    font-weight: 700;
    margin: 5px 0;
  }

  .metric-change {
    font-size: 13px;
  }
}
</style>
