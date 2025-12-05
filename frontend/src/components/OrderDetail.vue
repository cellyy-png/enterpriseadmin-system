<template>
  <div class="order-detail">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="订单号">
        {{ order.orderNumber }}
      </el-descriptions-item>
      <el-descriptions-item label="客户">
        {{ order.user?.username }} ({{ order.user?.email }})
      </el-descriptions-item>
      <el-descriptions-item label="订单状态">
        <el-tag>{{ order.status }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="支付状态">
        <el-tag>{{ order.paymentStatus }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="下单时间">
        {{ formatDate(order.createdAt) }}
      </el-descriptions-item>
      <el-descriptions-item label="支付方式">
        {{ order.paymentMethod || '未选择' }}
      </el-descriptions-item>
    </el-descriptions>

    <h3 style="margin-top: 20px">商品明细</h3>
    <el-table :data="order.items" border style="margin-top: 10px">
      <el-table-column prop="product.name" label="商品名称" />
      <el-table-column prop="product.sku" label="SKU" width="120" />
      <el-table-column label="单价" width="100">
        <template #default="{ row }">¥{{ row.price.toFixed(2) }}</template>
      </el-table-column>
      <el-table-column prop="quantity" label="数量" width="80" />
      <el-table-column label="小计" width="120">
        <template #default="{ row }">¥{{ row.subtotal.toFixed(2) }}</template>
      </el-table-column>
    </el-table>

    <div style="text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold">
      订单总额: <span style="color: #f1556c">¥{{ order.totalAmount.toFixed(2) }}</span>
    </div>

    <div v-if="order.shippingAddress" style="margin-top: 20px">
      <h3>收货信息</h3>
      <el-descriptions :column="1" border style="margin-top: 10px">
        <el-descriptions-item label="收货人">
          {{ order.shippingAddress.recipientName }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ order.shippingAddress.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="收货地址">
          {{ order.shippingAddress.province }}
          {{ order.shippingAddress.city }}
          {{ order.shippingAddress.district }}
          {{ order.shippingAddress.address }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'

defineProps({
  order: {
    type: Object,
    required: true
  }
})

const formatDate = (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')
</script>