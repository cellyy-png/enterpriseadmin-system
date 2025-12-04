<template>
  <div class="data-screen">
    <div class="screen-header">
      <h1 class="screen-title">🎯 企业数据运营中心</h1>
      <div class="screen-time">{{ currentTime }}</div>
    </div>

    <!-- 核心指标 -->
    <el-row :gutter="20" class="kpi-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="kpi-card" style="border-color: #f7b84b">
          <div class="kpi-icon" style="background: #f7b84b">💰</div>
          <div class="kpi-content">
            <p class="kpi-title">今日销售额</p>
            <h2 class="kpi-value">¥{{ formatNumber(overview.totalRevenue) }}</h2>
            <p class="kpi-trend" style="color: #f7b84b">+15.3% ↑</p>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="kpi-card" style="border-color: #49cc90">
          <div class="kpi-icon" style="background: #49cc90">📦</div>
          <div class="kpi-content">
            <p class="kpi-title">今日订单</p>
            <h2 class="kpi-value">{{ overview.todayOrders || 0 }}</h2>
            <p class="kpi-trend" style="color: #49cc90">+8.2% ↑</p>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="kpi-card" style="border-color: #5b8def">
          <div class="kpi-icon" style="background: #5b8def">👥</div>
          <div class="kpi-content">
            <p class="kpi-title">活跃用户</p>
            <h2 class="kpi-value">{{ overview.totalUsers || 0 }}</h2>
            <p class="kpi-trend" style="color: #5b8def">+12.7% ↑</p>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="kpi-card" style="border-color: #f1556c">
          <div class="kpi-icon" style="background: #f1556c">🛍️</div>
          <div class="kpi-content">
            <p class="kpi-title">商品总数</p>
            <h2 class="kpi-value">{{ overview.totalProducts || 0 }}</h2>
            <p class="kpi-trend" style="color: #f1556c">+5.1% ↑</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 主要图表区 -->
    <el-row :gutter="20" class="main-charts">
      <el-col :xs="24" :lg="16">
        <div class="chart-container large">
          <div class="chart-header">
            <h3>📈 销售趋势分析</h3>
            <span class="chart-subtitle">近30天数据</span>
          </div>
          <v-chart :option="salesTrendOption" style="height: 350px" />
        </div>
      </el-col>

      <el-col :xs="24" :lg="8">
        <div class="chart-container">
          <div class="chart-header">
            <h3>🎯 分类销售占比</h3>
          </div>
          <v-chart :option="categoryOption" style="height: 350px" />
        </div>
      </el-col>
    </el-row>

    <!-- 次要图表区 -->
    <el-row :gutter="20" class="secondary-charts">
      <el-col :xs="24" :md="12" :lg="8">
        <div class="chart-container">
          <div class="chart-header">
            <h3>🔥 热销商品TOP5</h3>
          </div>
          <v-chart :option="topProductsOption" style="height: 300px" />
        </div>
      </el-col>

      <el-col :xs="24" :md="12" :lg="8">
        <div class="chart-container">
          <div class="chart-header">
            <h3>📊 用户增长趋势</h3>
          </div>
          <v-chart :option="userGrowthOption" style="height: 300px" />
        </div>
      </el-col>

      <el-col :xs="24" :md="12" :lg="8">
        <div class="chart-container">
          <div class="chart-header">
            <h3>⚡ 实时数据流</h3>
          </div>
          <div class="realtime-stats">
            <div class="stat-row">
              <span class="stat-label">在线用户</span>
              <span class="stat-value pulse">{{ realtimeData.onlineUsers }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">待处理订单</span>
              <span class="stat-value">{{ realtimeData.pendingOrders }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">库存预警</span>
              <span class="stat-value warning">{{ realtimeData.lowStock }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">今日访问</span>
              <span class="stat-value">{{ realtimeData.todayVisits }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import dayjs from 'dayjs'
import { dashboardAPI } from '@/utils/request'

use([CanvasRenderer, LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent])

const currentTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
const overview = ref({})
const salesTrend = ref([])
const realtimeData = ref({
  onlineUsers: 0,
  pendingOrders: 0,
  lowStock: 0,
  todayVisits: 0
})

let timer = null

onMounted(() => {
  loadAllData()
  timer = setInterval(() => {
    currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
    updateRealtimeData()
  }, 1000)

  const dataTimer = setInterval(loadAllData, 30000)
  onUnmounted(() => clearInterval(dataTimer))
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const loadAllData = async () => {
  try {
    const [overviewRes, salesRes] = await Promise.all([
      dashboardAPI.overview(),
      dashboardAPI.salesTrend('30days')
    ])
    overview.value = overviewRes.data
    salesTrend.value = salesRes.data.salesData
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

const updateRealtimeData = () => {
  realtimeData.value = {
    onlineUsers: Math.floor(Math.random() * 500) + 100,
    pendingOrders: Math.floor(Math.random() * 50) + 10,
    lowStock: Math.floor(Math.random() * 20) + 5,
    todayVisits: Math.floor(Math.random() * 10000) + 5000
  }
}

const formatNumber = (num) => {
  return (num || 0).toLocaleString()
}

const salesTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    data: salesTrend.value.map(d => d._id),
    axisLine: { lineStyle: { color: '#666' } }
  },
  yAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: '#666' } }
  },
  series: [
    {
      name: '销售额',
      type: 'line',
      data: salesTrend.value.map(d => d.revenue),
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(91, 141, 239, 0.8)' },
            { offset: 1, color: 'rgba(91, 141, 239, 0)' }
          ]
        }
      },
      itemStyle: { color: '#5b8def' }
    }
  ]
}))

const categoryOption = computed(() => ({
  tooltip: { trigger: 'item' },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 4500, name: '电子产品', itemStyle: { color: '#5b8def' } },
        { value: 3200, name: '服装鞋包', itemStyle: { color: '#49cc90' } },
        { value: 2800, name: '食品饮料', itemStyle: { color: '#f7b84b' } },
        { value: 2100, name: '家居用品', itemStyle: { color: '#f1556c' } },
        { value: 1400, name: '其他', itemStyle: { color: '#8884d8' } }
      ],
      label: {
        formatter: '{b}: {d}%',
        color: '#fff'
      }
    }
  ]
}))

const topProductsOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '5%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'value', axisLine: { lineStyle: { color: '#666' } } },
  yAxis: {
    type: 'category',
    data: ['Apple Watch', 'iPad Air', 'AirPods Pro', 'MacBook Pro', 'iPhone 15'],
    axisLine: { lineStyle: { color: '#666' } }
  },
  series: [
    {
      type: 'bar',
      data: [1567, 678, 2345, 890, 1234],
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#49cc90' },
            { offset: 1, color: '#3bb77e' }
          ]
        }
      },
      barWidth: 20
    }
  ]
}))

const userGrowthOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLine: { lineStyle: { color: '#666' } }
  },
  yAxis: { type: 'value', axisLine: { lineStyle: { color: '#666' } } },
  series: [
    {
      type: 'line',
      data: [120, 132, 101, 134, 90, 230, 210],
      smooth: true,
      itemStyle: { color: '#f7b84b' },
      lineStyle: { width: 3 }
    }
  ]
}))
</script>

<style lang="scss" scoped>
.data-screen {
  background: #0f1419;
  min-height: 100vh;
  padding: 20px;
  color: white;

  .screen-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;

    .screen-title {
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .screen-time {
      font-size: 18px;
      color: #999;
      font-family: 'Courier New', monospace;
    }
  }

  .kpi-row {
    margin-bottom: 20px;
  }

  .kpi-card {
    background: linear-gradient(135deg, #1a1d2e 0%, #2a2d3e 100%);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 20px;
    border: 2px solid;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }

    .kpi-icon {
      width: 70px;
      height: 70px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }

    .kpi-title {
      color: #999;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .kpi-value {
      font-size: 32px;
      font-weight: 700;
      margin: 8px 0;
    }

    .kpi-trend {
      font-size: 14px;
      font-weight: 600;
    }
  }

  .chart-container {
    background: linear-gradient(135deg, #1a1d2e 0%, #2a2d3e 100%);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 20px;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
      }

      .chart-subtitle {
        color: #999;
        font-size: 13px;
      }
    }
  }

  .realtime-stats {
    padding: 20px 0;

    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .stat-label {
        color: #999;
      }

      .stat-value {
        font-size: 20px;
        font-weight: 700;
        color: #49cc90;

        &.pulse {
          animation: pulse 2s infinite;
        }

        &.warning {
          color: #f7b84b;
        }
      }
    }
  }
}

