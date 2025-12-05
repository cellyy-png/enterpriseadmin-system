<template>
  <div class="category-management">
    <div class="page-header">
      <h1>分类管理</h1>
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        新增分类
      </el-button>
    </div>

    <el-card shadow="never">
      <el-table :data="categories" row-key="_id" border stripe>
        <el-table-column prop="name" label="分类名称" min-width="200" />
        <el-table-column prop="slug" label="分类标识" width="150" />
        <el-table-column label="层级" width="80">
          <template #default="{ row }">
            {{ row.level }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '激活' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="80">
          <template #default="{ row }">
            {{ row.sortOrder }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
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
    </el-card>

    <el-dialog
        v-model="dialogVisible"
        :title="formData._id ? '编辑分类' : '新增分类'"
        width="600px"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="分类标识" prop="slug">
          <el-input v-model="formData.slug" placeholder="如: electronics" />
        </el-form-item>
        <el-form-item label="父分类">
          <el-select v-model="formData.parent" placeholder="选择父分类" clearable>
            <el-option
                v-for="cat in rootCategories"
                :key="cat._id"
                :label="cat.name"
                :value="cat._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分类描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.isActive" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { categoryAPI } from '@/utils/request'

const categories = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)

const formData = reactive({
  _id: '',
  name: '',
  slug: '',
  parent: null,
  description: '',
  sortOrder: 0,
  isActive: true
})

const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  slug: [{ required: true, message: '请输入分类标识', trigger: 'blur' }]
}

const rootCategories = computed(() =>
    categories.value.filter(cat => !cat.parent)
)

onMounted(() => {
  loadCategories()
})

const loadCategories = async () => {
  try {
    const { data } = await categoryAPI.list()
    categories.value = data.categories
  } catch (error) {
    ElMessage.error('加载分类失败')
  }
}

const handleAdd = () => {
  Object.assign(formData, {
    _id: '',
    name: '',
    slug: '',
    parent: null,
    description: '',
    sortOrder: 0,
    isActive: true
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await categoryAPI.delete(row._id)
      ElMessage.success('删除成功')
      loadCategories()
    } catch (error) {
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  })
}

const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (formData._id) {
        await categoryAPI.update(formData._id, formData)
        ElMessage.success('更新成功')
      } else {
        await categoryAPI.create(formData)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadCategories()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  })
}

const formatDate = (date) => dayjs(date).format('YYYY-MM-DD')
</script>

<style lang="scss" scoped>
.category-management {
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
}
</style>
