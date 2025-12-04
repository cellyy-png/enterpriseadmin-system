<template>
  <div class="product-management">
    <div class="page-header">
      <h1>商品管理</h1>
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        新增商品
      </el-button>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input
              v-model="filters.search"
              placeholder="搜索商品名称或SKU"
              :prefix-icon="Search"
              clearable
          />
        </el-form-item>
        <el-form-item>
          <el-select
              v-model="filters.category"
              placeholder="商品分类"
              clearable
          >
            <el-option
                v-for="cat in categories"
                :key="cat._id"
                :label="cat.name"
                :value="cat._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.status" placeholder="状态" clearable>
            <el-option label="上架" value="active" />
            <el-option label="下架" value="inactive" />
            <el-option label="缺货" value="out_of_stock" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadProducts">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="products" stripe>
        <el-table-column label="图片" width="80">
          <template #default="{ row }">
            <el-image
                :src="row.images?.[0] || 'https://via.placeholder.com/50'"
                fit="cover"
                style="width: 50px; height: 50px; border-radius: 8px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="sku" label="SKU" width="120" />
        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            <el-tag type="info">{{ row.category?.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="100">
          <template #default="{ row }">
            <span :class="['stock', row.stock < 10 ? 'low-stock' : '']">
              {{ row.stock }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
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
          @size-change="loadProducts"
          @current-change="loadProducts"
      />
    </el-card>

    <!-- 商品表单弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="formData._id ? '编辑商品' : '新增商品'"
        width="800px"
    >
      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="formData.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="SKU" prop="sku">
              <el-input v-model="formData.sku" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="商品描述">
          <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="销售价格" prop="price">
              <el-input-number
                  v-model="formData.price"
                  :min="0"
                  :precision="2"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="原价">
              <el-input-number
                  v-model="formData.originalPrice"
                  :min="0"
                  :precision="2"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="库存" prop="stock">
              <el-input-number
                  v-model="formData.stock"
                  :min="0"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="formData.category" style="width: 100%">
                <el-option
                    v-for="cat in categories"
                    :key="cat._id"
                    :label="cat.name"
                    :value="cat._id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="formData.status" style="width: 100%">
                <el-option label="上架" value="active" />
                <el-option label="下架" value="inactive" />
                <el-option label="缺货" value="out_of_stock" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="标签">
          <el-input
              v-model="formData.tags"
              placeholder="多个标签用逗号分隔，如: 热销,新品"
          />
        </el-form-item>

        <el-form-item label="图片URL">
          <el-input
              v-model="formData.images"
              placeholder="https://example.com/image.jpg"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productAPI, categoryAPI } from '@/utils/request'

const loading = ref(false)
const products = ref([])
const categories = ref([])
const pagination = ref({ total: 0 })
const dialogVisible = ref(false)
const formRef = ref(null)

const filters = reactive({
  page: 1,
  limit: 10,
  search: '',
  category: '',
  status: ''
})

const formData = reactive({
  _id: '',
  name: '',
  sku: '',
  description: '',
  price: 0,
  originalPrice: 0,
  stock: 0,
  category: '',
  status: 'active',
  tags: '',
  images: ''
})

const formRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  sku: [{ required: true, message: '请输入SKU', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

onMounted(() => {
  loadProducts()
  loadCategories()
})

const loadProducts = async () => {
  loading.value = true
  try {
    const { data } = await productAPI.list(filters)
    products.value = data.products
    pagination.value = data.pagination
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const { data } = await categoryAPI.list()
    categories.value = data.categories
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const handleAdd = () => {
  Object.assign(formData, {
    _id: '',
    name: '',
    sku: '',
    description: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    category: '',
    status: 'active',
    tags: '',
    images: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(formData, {
    ...row,
    category: row.category?._id,
    tags: row.tags?.join(', ') || '',
    images: row.images?.[0] || ''
  })
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await productAPI.delete(row._id)
      ElMessage.success('删除成功')
      loadProducts()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    const submitData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      images: formData.images ? [formData.images] : []
    }

    try {
      if (formData._id) {
        await productAPI.update(formData._id, submitData)
        ElMessage.success('更新成功')
      } else {
        await productAPI.create(submitData)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadProducts()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  })
}

const handleReset = () => {
  Object.assign(filters, { page: 1, search: '', category: '', status: '' })
  loadProducts()
}

const getStatusType = (status) => {
  const map = { active: 'success', inactive: 'danger', out_of_stock: 'warning' }
  return map[status] || ''
}

const getStatusLabel = (status) => {
  const map = { active: '上架', inactive: '下架', out_of_stock: '缺货' }
  return map[status] || status
}
</script>

<style lang="scss" scoped>
.product-management {
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

  .price {
    font-weight: 600;
    color: #f1556c;
  }

  .stock {
    font-weight: 600;
    color: #49cc90;

    &.low-stock {
      color: #f7b84b;
    }
  }

  .el-pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }
}
</style>
