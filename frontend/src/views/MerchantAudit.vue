<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商家入驻审核</span>
          <el-button type="primary" @click="fetchData" :icon="Refresh">刷新</el-button>
        </div>
      </template>

      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="createdAt" label="申请时间">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default>
            <el-tag type="warning">待审核</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="success" size="small" @click="handleAudit(scope.row, 'active')">通过</el-button>
            <el-button type="danger" size="small" @click="showRejectDialog(scope.row)">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 拒绝理由对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝申请" width="500px">
      <el-form :model="rejectForm" ref="rejectFormRef">
        <el-form-item label="拒绝理由" prop="rejectReason" :rules="{ required: true, message: '请输入拒绝理由', trigger: 'blur' }">
          <el-input 
            v-model="rejectForm.rejectReason" 
            type="textarea" 
            placeholder="请输入拒绝理由"
            :autosize="{ minRows: 3, maxRows: 6 }"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRejectConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMerchantApplications, auditMerchant } from '@/api/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';

const tableData = ref([]);
const loading = ref(false);

// 拒绝对话框相关
const rejectDialogVisible = ref(false);
const rejectForm = ref({
  userId: '',
  rejectReason: ''
});
const rejectFormRef = ref(null);
const currentUserRow = ref(null);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString();
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getMerchantApplications();
    console.log('商家入驻申请API响应:', res); // 添加调试信息
    
    // 修复：根据实际API响应结构调整数据访问路径
    if (res && typeof res === 'object') {
      if (Array.isArray(res)) {
        // 如果API直接返回数组
        tableData.value = res;
      } else if (res.data && Array.isArray(res.data.data)) {
        // 如果API返回 { data: { data: [...] } }
        tableData.value = res.data.data;
      } else if (res.data && Array.isArray(res.data)) {
        // 如果API返回 { data: [...] }
        tableData.value = res.data;
      } else if (res.data && res.data.length !== undefined) {
        // 如果API返回 { data: [...] } 但不是数组
        tableData.value = res.data;
      } else if (res.success && res.data && Array.isArray(res.data)) {
        // 如果API返回 { success: true, data: [...] }
        tableData.value = res.data;
      } else {
        // 其他情况，使用默认值
        tableData.value = [];
      }
    } else {
      // 响应不是对象，使用默认值
      tableData.value = [];
    }
    
    console.log('处理后的商家入驻申请数据:', tableData.value);
  } catch (error) {
    console.error('加载商家入驻申请失败:', error);
    tableData.value = [];
  } finally {
    loading.value = false;
  }
};

const handleAudit = (row, status) => {
  const actionText = status === 'active' ? '通过' : '拒绝';
  ElMessageBox.confirm(
    `确定要${actionText}商家 ${row.username} 的入驻申请吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: status === 'active' ? 'success' : 'warning',
    }
  ).then(async () => {
    try {
      await auditMerchant(row._id, { status });
      ElMessage.success(`已${actionText}`);
      fetchData();
    } catch (error) {
      ElMessage.error('操作失败: ' + (error.response?.data?.message || error.message));
    }
  });
};

// 显示拒绝对话框
const showRejectDialog = (row) => {
  currentUserRow.value = row;
  rejectForm.value.userId = row._id;
  rejectForm.value.rejectReason = '';
  rejectDialogVisible.value = true;
};

// 处理拒绝确认
const handleRejectConfirm = async () => {
  try {
    await rejectFormRef.value.validate();
    
    await auditMerchant(currentUserRow.value._id, { 
      status: 'rejected', 
      rejectReason: rejectForm.value.rejectReason 
    });
    
    ElMessage.success('已拒绝申请');
    rejectDialogVisible.value = false;
    fetchData();
  } catch (error) {
    ElMessage.error('操作失败: ' + (error.response?.data?.message || error.message));
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>