<template>
  <div class="dashboard">
    <h1 class="page-title">数据总览</h1>

    <!-- 关键指标卡片 -->
    <el-row :gutter="20" class="metrics-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <MetricCard
            title="总用户数"
            :value="overview.totalUsers || 0"
            :change="`+${overview.todayUsers || 0} 今日新增`"
            icon="User"
            color="#5b8def"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <MetricCard
            title="总订单数"
            :value="overview.totalOrders || 0"
            :change="`+${overview.todayOrders || 0} 今日订单`"
            icon="ShoppingCart"
            color="#49cc90"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <MetricCard
            title="总销售额"
            :value="`¥${(overview.totalRevenue || 0).toLocaleString()}`"
            change="+12.5% 较上月"
            icon="Money"
            color="#f7b84b"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <MetricCard
            title="商品总数"
            :value="overview.totalProducts || 0"
            change="活跃商品"
            icon="Goods"
            color="#f1556c"
        />
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <h3>销售趋势（近7天）</h3>
          </template>
          <v-chart :option="salesTrendOption" style="height: 300px" />
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <h3>订单状态分布</h3>
          </template>
          <v-chart :option="orderStatusOption" style="height: 300px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-card class="quick-actions-card">
      <template #header>
        <h3>快速操作</h3>
      </template>
      <el-row :gutter="15">
        <el-col :xs="12" :sm="6">
          <el-button class="action-button" @click="$router.push('/users')">
            <el-icon size="24"><UserFilled /></el-icon>
            <span>新增用户</span>
          </el-button>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-button class="action-button" @click="$router.push('/orders')">
            <el-icon size="24"><Box /></el-icon>
            <span>新增订单</span>
          </el-button>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-button class="action-button" @click="$router.push('/products')">
            <el-icon size="24"><Goods /></el-icon>
            <span>新增商品</span>
          </el-button>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-button class="action-button" @click="handleGenerateReport">
            <el-icon size="24"><Document /></el-icon>
            <span>生成报告</span>
          </el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { UserFilled, Box, Goods, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { dashboardAPI } from '@/utils/request'
import MetricCard from '@/components/MetricCard.vue'

use([CanvasRenderer, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent])

const overview = ref({})
const salesTrend = ref([])
const orderStatusStats = ref([])

onMounted(() => {
  loadDashboardData()
})

const loadDashboardData = async () => {
  try {
    const [overviewRes, salesRes, orderStatsRes] = await Promise.all([
      dashboardAPI.overview(),
      dashboardAPI.salesTrend('7days'),
      dashboardAPI.orderStatusStats()
    ])
    overview.value = overviewRes.data
    salesTrend.value = salesRes.data.salesData
    orderStatusStats.value = orderStatsRes.data.stats
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

const salesTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['销售额', '订单数'] },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    data: salesTrend.value.map(d => d._id)
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '销售额',
      type: 'line',
      data: salesTrend.value.map(d => d.revenue),
      smooth: true,
      itemStyle: { color: '#5b8def' }
    },
    {
      name: '订单数',
      type: 'line',
      data: salesTrend.value.map(d => d.orders),
      smooth: true,
      itemStyle: { color: '#49cc90' }
    }
  ]
}))

const orderStatusOption = computed(() => {
  // 定义状态映射和颜色
  const statusMap = {
    pending: { name: '待处理', color: '#f7b84b' },
    confirmed: { name: '已确认', color: '#5b8def' },
    processing: { name: '处理中', color: '#49cc90' },
    shipped: { name: '已发货', color: '#34c38f' },
    delivered: { name: '已送达', color: '#00c853' },
    cancelled: { name: '已取消', color: '#f1556c' }
  };

  // 处理从后端获取的数据
  const processedData = orderStatusStats.value.map(stat => {
    const statusInfo = statusMap[stat._id] || { name: stat._id || '未知状态', color: '#999' };
    return {
      value: stat.count,
      name: statusInfo.name,
      itemStyle: { color: statusInfo.color }
    };
  });

  // 如果没有数据，显示默认空数据
  if (processedData.length === 0) {
    processedData.push({
      value: 1,
      name: '暂无数据',
      itemStyle: { color: '#eee' }
    });
  }

  return {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        type: 'pie',
        radius: '70%',
        data: processedData
      }
    ]
  };
})

const handleGenerateReport = () => {
  ElMessage.success('报告生成中...')
}
</script>

<style lang="scss" scoped>
.dashboard {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-title {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 20px;
}

.metrics-row {
  margin-bottom: 20px;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  :deep(.el-card__header) {
    h3 {
      margin: 0;
      font-size: 16px;
    }
  }
}

.quick-actions-card {
  .action-button {
    width: 100%;
    height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    font-size: 14px;
    font-weight: 600;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
  }
}
</style>