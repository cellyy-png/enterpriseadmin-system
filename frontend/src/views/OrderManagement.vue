<template>
  <div class="order-management">
    <div class="page-header">
      <h1>订单管理</h1>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-label">待处理</span>
          <span class="stat-value">{{ pendingCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">处理中</span>
          <span class="stat-value">{{ processingCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已完成</span>
          <span class="stat-value">{{ completedCount }}</span>
        </div>
      </div>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-select v-model="filters.status" placeholder="订单状态" clearable>
            <el-option label="全部状态" value="" />
            <el-option
                v-for="(label, key) in statusLabels"
                :key="key"
                :label="label"
                :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.paymentStatus" placeholder="支付状态" clearable>
            <el-option label="全部支付状态" value="" />
            <el-option label="已支付" value="paid" />
            <el-option label="未支付" value="unpaid" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadOrders">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="orders" stripe>
        <el-table-column label="订单号" min-width="180">
          <template #default="{ row }">
            <span class="order-number">{{ row.orderNumber }}</span>
          </template>
        </el-table-column>
        <el-table-column label="客户" min-width="120">
          <template #default="{ row }">
            {{ row.user?.username || '未知' }}
          </template>
        </el-table-column>
        <el-table-column label="订单金额" min-width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.totalAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ statusLabels[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="支付状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getPaymentType(row.paymentStatus)">
              {{ getPaymentLabel(row.paymentStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-dropdown v-if="row.status !== 'delivered' && row.status !== 'cancelled'">
              <el-button type="info" size="small">
                更新状态 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                      v-for="(label, key) in statusLabels"
                      :key="key"
                      @click="handleUpdateStatus(row._id, key)"
                  >
                    {{ label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-model:current-page="filters.page"
          v-model:page-size="filters.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadOrders"
          @current-change="loadOrders"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" title="订单详情" width="900px">
      <OrderDetail v-if="selectedOrder" :order="selectedOrder" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Refresh, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { orderAPI } from '@/utils/request'
import OrderDetail from '@/components/OrderDetail.vue'

const loading = ref(false)
const orders = ref([])
const pagination = ref({ total: 0 })
const dialogVisible = ref(false)
const selectedOrder = ref(null)
const dateRange = ref([])

const filters = reactive({
  page: 1,
  limit: 10,
  status: '',
  paymentStatus: ''
})

const statusLabels = {
  pending: '待处理',
  confirmed: '已确认',
  processing: '处理中',
  shipped: '已发货',
  delivered: '已送达',
  cancelled: '已取消'
}

const pendingCount = computed(() => orders.value.filter(o => o.status === 'pending').length)
const processingCount = computed(() => orders.value.filter(o => o.status === 'processing').length)
const completedCount = computed(() => orders.value.filter(o => o.status === 'delivered').length)

onMounted(() => {
  loadOrders()
})

const loadOrders = async () => {
  loading.value = true
  try {
    const params = { ...filters }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const { data } = await orderAPI.list(params)
    orders.value = data.orders
    pagination.value = data.pagination
  } finally {
    loading.value = false
  }
}

const handleView = (row) => {
  selectedOrder.value = row
  dialogVisible.value = true
}

const handleUpdateStatus = async (orderId, status) => {
  try {
    await orderAPI.updateStatus(orderId, status)
    ElMessage.success('状态更新成功')
    loadOrders()
  } catch (error) {
    ElMessage.error('状态更新失败')
  }
}

const handleReset = () => {
  Object.assign(filters, { page: 1, status: '', paymentStatus: '' })
  dateRange.value = []
  loadOrders()
}

const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'primary',
    shipped: '',
    delivered: 'success',
    cancelled: 'danger'
  }
  return map[status] || ''
}

const getPaymentType = (status) => {
  const map = { paid: 'success', unpaid: 'warning', refunded: 'info' }
  return map[status] || ''
}

const getPaymentLabel = (status) => {
  const map = { paid: '已支付', unpaid: '未支付', refunded: '已退款' }
  return map[status] || status
}

const formatDate = (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')
</script>

<style lang="scss" scoped>
.order-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
      font-size: 24px;
      margin: 0;
    }

    .header-stats {
      display: flex;
      gap: 30px;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .stat-label {
          font-size: 12px;
          color: #7f8c8d;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #2c3e50;
          margin-top: 4px;
        }
      }
    }
  }

  .filter-card,
  .table-card {
    margin-bottom: 20px;
  }

  .order-number {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: #5b8def;
  }

  .amount {
    font-weight: 700;
    color: #f1556c;
    font-size: 15px;
  }

  .el-pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }
}
</style>
