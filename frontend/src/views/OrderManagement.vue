<template>
  <div class="order-management">
    <div class="page-header">
      <h1>订单管理</h1>
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        新增订单
      </el-button>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters">
        <el-form-item label="订单号">
          <el-input 
            v-model="filters.orderNumber" 
            placeholder="请输入订单号" 
            clearable
            @keyup.enter="loadOrders"
          />
        </el-form-item>
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
            <el-button type="success" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="70%" top="30px" scrollbar-always-on>
      <el-form
          v-if="dialogType !== 'view'"
          ref="orderFormRef"
          :model="formData"
          :rules="formRules"
          label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户" prop="user">
              <el-select 
                v-model="formData.user" 
                filterable 
                remote 
                :remote-method="loadUsers" 
                :loading="usersLoading"
                style="width: 100%"
                placeholder="请输入用户名搜索"
              >
                <el-option
                  v-for="item in userList"
                  :key="item._id"
                  :label="item.username"
                  :value="item._id">
                  <span style="float: left">{{ item.username }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.email }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单号">
              <el-input v-model="formData.orderNumber" :disabled="!!formData._id" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 订单商品 -->
        <el-divider>订单商品</el-divider>
        <el-table :data="formData.items" style="width: 100%" border>
          <el-table-column label="商品">
            <template #default="{ row, $index }">
              <el-select 
                v-model="row.product" 
                filterable 
                remote 
                :remote-method="(query) => loadProducts(query, $index)"
                :loading="productsLoading[$index]"
                placeholder="搜索商品"
                style="width: 100%"
                @change="(val) => updateProductInfo(val, $index)"
              >
                <el-option
                  v-for="item in productLists[$index] || []"
                  :key="item._id"
                  :label="item.name"
                  :value="item._id">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">¥{{ item.price }}</span>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="150">
            <template #default="{ row }">
              <el-input-number 
                v-model="row.quantity" 
                :min="1" 
                controls-position="right"
                style="width: 120px"
                @change="calculateTotal"
              />
            </template>
          </el-table-column>
          <el-table-column label="单价" width="120">
            <template #default="{ row }">
              ¥{{ row.price }}
            </template>
          </el-table-column>
          <el-table-column label="小计" width="120">
            <template #default="{ row }">
              ¥{{ (row.quantity * row.price).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ $index }">
              <el-button 
                type="danger" 
                size="small" 
                @click="removeItem($index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 10px;">
          <el-button type="primary" @click="addItem">添加商品</el-button>
        </div>

        <el-divider>收货信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="收货人姓名" prop="shippingAddress.recipientName">
              <el-input v-model="formData.shippingAddress.recipientName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="shippingAddress.phone">
              <el-input v-model="formData.shippingAddress.phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="详细地址" prop="shippingAddress.address">
          <el-input v-model="formData.shippingAddress.address" />
        </el-form-item>

        <el-divider>订单状态</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单状态" prop="status">
              <el-select v-model="formData.status" style="width: 100%">
                <el-option
                    v-for="(label, key) in statusLabels"
                    :key="key"
                    :label="label"
                    :value="key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="支付状态" prop="paymentStatus">
              <el-select v-model="formData.paymentStatus" style="width: 100%">
                <el-option label="未支付" value="unpaid" />
                <el-option label="已支付" value="paid" />
                <el-option label="已退款" value="refunded" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注">
          <el-input v-model="formData.notes" type="textarea" />
        </el-form-item>
        
        <el-form-item label="总金额">
          <span class="amount">¥{{ calculateTotalAmount().toFixed(2) }}</span>
        </el-form-item>
      </el-form>
      
      <OrderDetail v-else-if="dialogType === 'view'" :order="selectedOrder" />
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="dialogType !== 'view'" type="primary" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { orderAPI, userAPI, productAPI } from '@/utils/request'
import OrderDetail from '@/components/OrderDetail.vue'

const loading = ref(false)
const usersLoading = ref(false)
const productsLoading = ref({})
const orders = ref([])
const userList = ref([])
const productLists = ref({})
const pagination = ref({ total: 0 })
const dialogVisible = ref(false)
const dialogType = ref('view') // 'view', 'add', 'edit'
const orderFormRef = ref(null)
const selectedOrder = ref(null)
const dateRange = ref([])

const filters = reactive({
  page: 1,
  limit: 10,
  status: '',
  paymentStatus: '',
  orderNumber: ''
})

const formData = reactive({
  _id: '',
  orderNumber: '',
  user: '',
  items: [{
    product: '',
    quantity: 1,
    price: 0
  }],
  totalAmount: 0,
  status: 'pending',
  paymentStatus: 'unpaid',
  shippingAddress: {
    recipientName: '',
    phone: '',
    address: ''
  },
  notes: ''
})

const formRules = {
  user: [
    { required: true, message: '请选择客户', trigger: 'change' }
  ],
  'shippingAddress.recipientName': [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' }
  ],
  'shippingAddress.phone': [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ],
  'shippingAddress.address': [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择订单状态', trigger: 'change' }
  ],
  paymentStatus: [
    { required: true, message: '请选择支付状态', trigger: 'change' }
  ]
}

const statusLabels = {
  pending: '待处理',
  confirmed: '已确认',
  processing: '处理中',
  shipped: '已发货',
  delivered: '已送达',
  cancelled: '已取消'
}

const dialogTitle = computed(() => {
  switch (dialogType.value) {
    case 'add': return '新增订单'
    case 'edit': return '编辑订单'
    case 'view': return '订单详情'
    default: return '订单详情'
  }
})

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

const loadUsers = async (query) => {
  usersLoading.value = true
  try {
    const { data } = await userAPI.list({ search: query, limit: 20 })
    userList.value = data.users
  } finally {
    usersLoading.value = false
  }
}

const loadProducts = async (query, index) => {
  // 初始化该索引的产品加载状态
  productsLoading.value[index] = true
  try {
    const { data } = await productAPI.list({ search: query, limit: 20 })
    // 使用 Vue.set 或者直接赋值确保响应性
    productLists.value[index] = data.products
  } finally {
    productsLoading.value[index] = false
  }
}

// 当选择商品时更新商品信息
const updateProductInfo = (productId, index) => {
  if (!productId) return
  
  const product = (productLists.value[index] || []).find(p => p._id === productId)
  if (product) {
    formData.items[index].price = product.price
    formData.items[index].quantity = 1
  }
}

const addItem = () => {
  formData.items.push({
    product: '',
    quantity: 1,
    price: 0
  })
}

const removeItem = (index) => {
  if (formData.items.length <= 1) {
    ElMessage.warning('订单至少需要包含一个商品')
    return
  }
  formData.items.splice(index, 1)
}

const calculateTotalAmount = () => {
  return formData.items.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
}

const handleAdd = () => {
  dialogType.value = 'add'
  resetFormData()
  dialogVisible.value = true
  loadUsers('')
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(formData, {
    ...row,
    user: row.user?._id || '',
    items: row.items.map(item => ({
      product: item.product._id || item.product,
      quantity: item.quantity,
      price: item.price || (item.product?.price ?? 0)
    }))
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  dialogType.value = 'view'
  selectedOrder.value = row
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await orderAPI.delete(row._id)
      ElMessage.success('删除成功')
      loadOrders()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const handleSubmit = async () => {
  await orderFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      // 确保每个商品都有选择产品
      const hasEmptyProduct = formData.items.some(item => !item.product)
      if (hasEmptyProduct) {
        ElMessage.error('请为每个商品选择产品')
        return
      }

      // 计算总金额
      formData.totalAmount = calculateTotalAmount()

      if (dialogType.value === 'edit') {
        await orderAPI.update(formData._id, formData)
        ElMessage.success('更新成功')
      } else if (dialogType.value === 'add') {
        await orderAPI.create(formData)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadOrders()
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error('操作失败: ' + (error.response?.data?.error || error.message || '未知错误'))
    }
  })
}

const resetFormData = () => {
  Object.assign(formData, {
    _id: '',
    orderNumber: '',
    user: '',
    items: [{
      product: '',
      quantity: 1,
      price: 0
    }],
    totalAmount: 0,
    status: 'pending',
    paymentStatus: 'unpaid',
    shippingAddress: {
      recipientName: '',
      phone: '',
      address: ''
    },
    notes: ''
  })
}

const handleReset = () => {
  Object.assign(filters, { 
    page: 1, 
    limit: 10, 
    status: '', 
    paymentStatus: '',
    orderNumber: ''
  })
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