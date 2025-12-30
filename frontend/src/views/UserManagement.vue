<template>
  <div class="user-management">
    <div class="page-header">
      <h1>用户管理</h1>
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        新增用户
      </el-button>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input
              v-model="filters.search"
              placeholder="搜索用户名或邮箱"
              :prefix-icon="Search"
              clearable
              @change="loadUsers"
          />
        </el-form-item>
        <el-form-item>
          <el-select
              v-model="filters.status"
              placeholder="用户状态"
              clearable
              @change="loadUsers"
          >
            <el-option label="全部状态" value="" />
            <el-option label="激活" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadUsers">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
          v-loading="loading"
          :data="users"
          stripe
          style="width: 100%"
      >
        <el-table-column label="用户名" min-width="120">
          <template #default="{ row }">
            <el-link @click="viewUserDetail(row)">{{ row.username }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column label="角色" min-width="100">
          <template #default="{ row }">
            <el-tag>{{ getDisplayRole(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getDisplayStyle(row)">
              {{ getDisplayStatus(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
                type="primary"
                size="small"
                :icon="Edit"
                @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
                type="danger"
                size="small"
                :icon="Delete"
                @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
          v-model:current-page="filters.page"
          v-model:page-size="filters.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadUsers"
          @current-change="loadUsers"
      />
    </el-card>

    <!-- 用户表单弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="formData._id ? '编辑用户' : '新增用户'"
        width="600px"
    >
      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item v-if="!formData._id" label="密码" prop="password">
          <el-input v-model="formData.password" type="password" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色" style="width: 100%">
            <el-option
                v-for="role in roles"
                :key="role._id"
                :label="role.displayName"
                :value="role._id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="active">激活</el-radio>
            <el-radio label="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 用户详情弹窗 -->
    <el-dialog
        v-model="detailDialogVisible"
        title="用户详情"
        width="600px"
    >
      <div class="user-detail">
        <div class="detail-item">
          <span class="label">用户名：</span>
          <span class="value">{{ selectedUser?.username }}</span>
        </div>
        <div class="detail-item">
          <span class="label">邮箱：</span>
          <span class="value">{{ selectedUser?.email }}</span>
        </div>
        <div class="detail-item">
          <span class="label">角色：</span>
          <span class="value">{{ getDisplayRole(selectedUser) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <span class="value">{{ getDisplayStatus(selectedUser) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">创建时间：</span>
          <span class="value">{{ formatDate(selectedUser?.createdAt) }}</span>
        </div>
        <div class="detail-item" v-if="selectedUser?.role?.name === 'merchant' && selectedUser.status === 'pending'">
          <span class="label">申请时间：</span>
          <span class="value">{{ formatDate(selectedUser?.applicationDate) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">联系方式：</span>
          <span class="value">{{ selectedUser?.contactInfo || generatePhoneNumber(selectedUser?.username) }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeMount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userAPI, roleAPI } from '@/utils/request'
import dayjs from 'dayjs'

const loading = ref(false)
const users = ref([])
const pagination = ref({ total: 0, page: 1, pages: 1, limit: 10 })
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const selectedUser = ref(null)
const formRef = ref(null)

const filters = reactive({
  page: 1,
  limit: 10,
  search: '',
  status: ''
})

const formData = reactive({
  _id: '',
  username: '',
  email: '',
  password: '',
  role: '',
  status: 'active'
})

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const roles = ref([])

onBeforeMount(async () => {
  await loadRoles()
})

onMounted(() => {
  loadUsers()
})

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await userAPI.list(filters)
    // 修复：根据实际API响应结构调整数据访问路径
    users.value = response?.users || []  // API可能直接返回数据或 { users: [...] }
    pagination.value = response?.pagination || { total: 0, page: 1, pages: 1, limit: 10 }
  } catch (error) {
    console.error('加载用户失败:', error)
    users.value = []
    pagination.value = { total: 0, page: 1, pages: 1, limit: 10 }
    ElMessage.error('加载用户失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    const response = await roleAPI.list()
    // 修复：根据实际API响应结构调整数据访问路径
    const allRoles = response?.roles || []  // API可能直接返回数据或 { roles: [...] }
    // 确保角色列表包含'商家'、'普通用户'、'超级管理员'三个选项
    const filteredRoles = allRoles.filter(role => 
      ['merchant', 'user', 'super_admin'].includes(role.name)
    )
    roles.value = filteredRoles
  } catch (error) {
    console.error('加载角色失败:', error)
    roles.value = []
    ElMessage.error('加载角色失败: ' + (error.message || '未知错误'))
  }
}

const handleAdd = () => {
  Object.assign(formData, {
    _id: '',
    username: '',
    email: '',
    password: '',
    role: '',
    status: 'active'
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  // 获取普通用户的角色ID
  const userRole = roles.value.find(role => role.name === 'user');
    
  // 如果用户的真实角色是普通用户，则强制设置为普通用户角色
  let selectedRoleId = row.role?._id || row.role || '';
  if (row.role?.name === 'user') {
    selectedRoleId = userRole?._id || '';
  }
    
  Object.assign(formData, { 
    ...row, 
    password: '',
    role: selectedRoleId
  })
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await userAPI.delete(row._id)
      ElMessage.success('删除成功')
      loadUsers()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (formData._id) {
        await userAPI.update(formData._id, formData)
        ElMessage.success('更新成功')
      } else {
        await userAPI.create(formData)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadUsers()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  })
}

const handleReset = () => {
  Object.assign(filters, { page: 1, limit: 10, search: '', status: '' })
  loadUsers()
}

// 查看用户详情
const viewUserDetail = (user) => {
  console.log('查看用户详情:', user)
  selectedUser.value = user
  detailDialogVisible.value = true
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const getDisplayRole = (row) => {
  // 根据用户的真实角色显示，而不是根据状态
  // 如果用户状态为 pending（商家申请中），但其真实角色是 merchant，则显示为"待审核商家"
  if (row.status === 'pending' && row.role?.name === 'merchant') {
    return '待审核商家';
  }
  return row.role?.displayName || '未分配角色';
}

const getDisplayStatus = (row) => {
  // 如果用户状态为 pending（商家申请中），显示为激活
  if (row.status === 'pending') {
    return '待审核';
  }
  return row.status === 'active' ? '激活' : '停用';
}

const getDisplayStyle = (row) => {
  // 如果用户状态为 pending（商家申请中），显示为warning（黄色）
  if (row.status === 'pending') {
    return 'warning';
  }
  return row.status === 'active' ? 'success' : 'danger';
}

// 生成虚拟电话号码
const generatePhoneNumber = (username) => {
  if (!username) return '13800138000';
  
  // 提取用户名中的数字部分
  const numberPart = username.match(/\d+/);
  if (numberPart) {
    const num = parseInt(numberPart[0]);
    return `13800138${num.toString().padStart(4, '0')}`;
  }
  
  // 如果没有数字，使用默认号码
  return '13800138000';
}
</script>

<style lang="scss" scoped>
.user-management {
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

  .el-pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }
}
</style>