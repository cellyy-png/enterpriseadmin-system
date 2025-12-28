<template>
  <div class="carousel-management">
    <div class="page-header">
      <h1>轮播图管理</h1>
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        新增轮播图
      </el-button>
    </div>

    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="carouselList"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column label="预览" width="200">
          <template #default="{ row }">
            <el-image
              :src="row.imageUrl.startsWith('http') ? row.imageUrl : '/uploads/' + row.imageUrl.split('/').pop() || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWUiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzMCIgZmlsbD0iIzMzMyIvPjxwYXRoIGQ9Ik0zMCAzMGMxMC0xMCAzMC0xMCA0MCAwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iOCIgZmlsbD0ibm9uZSIvPjwvc3ZnPg=='"
              class="carousel-image"
              fit="cover"
              :preview-src-list="[row.imageUrl.startsWith('http') ? row.imageUrl : '/uploads/' + row.imageUrl.split('/').pop()]"
              preview-teleported
            />
          </template>
        </el-table-column>

        <el-table-column prop="title" label="标题" min-width="150" />

        <el-table-column label="链接" min-width="200">
          <template #default="{ row }">
            <el-link
              v-if="row.linkUrl"
              :href="row.linkUrl"
              target="_blank"
              :underline="false"
            >
              {{ row.linkUrl }}
            </el-link>
            <span v-else>无</span>
          </template>
        </el-table-column>

        <el-table-column prop="sortOrder" label="排序" width="80" />

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="success" size="small" @click="handleReplace(row)">
              替换
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
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
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData._id ? '编辑轮播图' : '新增轮播图'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入轮播图标题"
          />
        </el-form-item>

        <el-form-item label="图片" prop="imageFile">
          <el-upload
            v-if="!formData.imagePreview"
            class="image-uploader"
            :show-file-list="false"
            :on-success="handleImageSuccess"
            :on-error="handleImageError"
            :before-upload="beforeImageUpload"
            :headers="uploadHeaders"
            name="image"
            :http-request="customUpload"
          >
            <el-button type="primary" :icon="Upload">
              点击上传
            </el-button>
            <div class="upload-tips">
              支持格式：jpg/png/webp，大小不超过5MB
            </div>
          </el-upload>
          <div v-else class="image-preview">
            <el-image
              :src="formData.imagePreview.startsWith('http') ? formData.imagePreview : formData.imagePreview.startsWith('/') ? formData.imagePreview : '/uploads/' + formData.imagePreview.split('/').pop() || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWUiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzMCIgZmlsbD0iIzMzMyIvPjxwYXRoIGQ9Ik0zMCAzMGMxMC0xMCAzMC0xMCA0MCAwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iOCIgZmlsbD0ibm9uZSIvPjwvc3ZnPg=='"
              class="preview-image"
              fit="contain"
              :preview-src-list="[formData.imagePreview.startsWith('http') ? formData.imagePreview : formData.imagePreview.startsWith('/') ? formData.imagePreview : '/uploads/' + formData.imagePreview.split('/').pop()]"
              preview-teleported
            />
            <el-button type="danger" @click="removeImage">删除图片</el-button>
          </div>
        </el-form-item>

        <el-form-item label="链接地址">
          <el-input
            v-model="formData.linkUrl"
            placeholder="点击后跳转的地址"
          />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number
            v-model="formData.sortOrder"
            :min="0"
            :step="1"
            placeholder="数字越小越靠前"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch
            v-model="formData.status"
            :active-value="'active'"
            :inactive-value="'inactive'"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 替换图片弹窗 -->
    <el-dialog
      v-model="replaceDialogVisible"
      title="替换图片"
      width="500px"
    >
      <el-form :model="replaceFormData" label-width="80px">
        <el-form-item label="新图片">
          <el-upload
            class="image-uploader"
            action="/api/carousels/upload"
            :show-file-list="false"
            :http-request="customReplaceUpload"
            :before-upload="beforeUpload"
          >
            <div v-if="replaceFormData.newImageFile" class="image-preview">
              <el-image
                :src="URL.createObjectURL(replaceFormData.newImageFile)"
                class="preview-image"
                fit="cover"
              />
              <div class="upload-actions">
                <el-button type="primary" size="small">重新上传</el-button>
              </div>
            </div>
            <el-button v-else type="primary" :icon="Upload">
              点击上传
            </el-button>
            <div class="upload-tips">
              支持格式：jpg/png/webp，大小不超过5MB
            </div>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="replaceDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleReplaceSubmit"
          :loading="replaceSubmitting"
          :disabled="!replaceFormData.newImageFile"
        >
          确定替换
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import { getCarouselList, createCarousel, updateCarousel, deleteCarousel } from '@/api/carousel'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores/user'
import axios from 'axios'

// 定义API基础URL常量
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 响应式数据
const carouselList = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const replaceDialogVisible = ref(false)
const submitting = ref(false)
const replaceSubmitting = ref(false)

// 表单引用
const formRef = ref(null)

const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token')}`
}

const userStore = useUserStore()

// 表单数据
const formData = reactive({
  _id: '',
  title: '',
  imageUrl: '',
  imageFile: null,
  imagePreview: '',
  linkUrl: '',
  sortOrder: 0,
  status: 'active'
})

// 替换表单数据
const replaceFormData = reactive({
  carouselId: '',
  newImageFile: null
})

// 分页数据
const filters = reactive({
  page: 1,
  limit: 10
})

const pagination = reactive({
  total: 0
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入轮播图标题', trigger: 'blur' }
  ]
}

// 获取轮播图列表
const loadCarousels = async () => {
  // 检查用户是否已登录
  if (!userStore.token) {
    ElMessage.error('请先登录')
    // 重定向到登录页面
    window.location.href = '/login'
    return
  }
  
  loading.value = true
  try {
    const response = await getCarouselList()
    carouselList.value = response.data || []
    pagination.total = response.data?.length || 0
  } catch (error) {
    console.error('加载轮播图失败:', error)
    // 检查是否是401错误
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      userStore.logout() // 使用store的logout方法清理状态
    } else {
      ElMessage.error('加载轮播图失败')
    }
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 图片处理函数
const handleImageSuccess = (response) => {
  console.log('图片上传成功回调，响应数据:', response); // 调试信息
  
  // 修复：确保响应数据结构正确，添加对response对象的全面检查
  let imageUrl = '';
  
  if (response === undefined || response === null) {
    // 这种情况可能是因为在自定义上传函数中没有正确传递数据
    console.warn('图片上传响应为空，可能在自定义上传函数中已处理');
    return;
  }
  
  // 根据后端实际返回的数据结构获取图片URL
  // 后端返回格式: { success: true, message: '...', url: '...' }
  imageUrl = response.url || response.data?.url || response.data?.data?.url || response.data?.imageUrl || response.imageUrl;
  
  // 如果响应是字符串，直接使用
  if (typeof response === 'string') {
    imageUrl = response;
  }
  
  if (!imageUrl) {
    // 尝试从不同可能的响应结构中获取图片URL
    if (response?.url) {
      imageUrl = response.url;
    } else if (response?.data?.url) {
      imageUrl = response.data.url;
    } else if (response?.data?.imageUrl) {
      imageUrl = response.data.imageUrl;
    }
  }
  
  if (imageUrl) {
    formData.imageUrl = imageUrl;
    // 修改处：直接使用相对路径，不拼接 localhost:5000
    formData.imagePreview = imageUrl;
    console.log('图片上传成功，URL:', imageUrl);
    // 只在实际有URL更新时显示成功消息
    ElMessage.success('图片上传成功');
  } else {
    ElMessage.error('图片上传失败：无法获取图片URL');
    console.error('图片上传响应格式不正确:', response);
  }
};

const handleImageError = (error) => {
  console.error('图片上传失败:', error);
  console.error('错误详情:', error?.response || error?.message || error);
  
  let errorMessage = '未知错误';
  if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error?.response?.data?.error) {
    errorMessage = error.response.data.error;
  } else if (error?.message) {
    errorMessage = error.message;
  } else {
    errorMessage = error || '图片上传失败';
  }
  
  ElMessage.error('图片上传失败: ' + errorMessage);
};

const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!');
  }
  return isImage && isLt5M;
};

// 自定义上传方法
const customUpload = async (options) => {
  const { file, onSuccess, onError } = options;
  
  // 检查认证令牌是否存在
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('认证令牌不存在');
    onError(new Error('未认证：请先登录'));
    return;
  }
  
  // 创建FormData对象
  const uploadFormData = new FormData();
  uploadFormData.append('image', file);
  
  try {
    // 使用轮播图API上传图片
    const response = await axios.post(`${API_BASE_URL}/carousels/upload-image`, uploadFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('上传响应:', response); // 调试信息
    
    // 检查响应是否成功
    if (response.data && response.data.success !== false) {
      // 上传成功后调用success回调，传递响应数据
      onSuccess(response.data);
    } else {
      // 如果后端返回失败状态，调用错误回调
      onError(new Error(response.data.message || '上传失败'));
    }
  } catch (error) {
    console.error('上传错误详情:', error); // 调试信息
    console.error('错误响应:', error.response); // 调试信息
    
    // 检查是否是认证错误
    if (error.response?.status === 401) {
      console.error('认证失败：令牌可能已过期');
      // 尝试从错误响应中获取更多信息
      const errorMessage = error.response.data?.message || '认证失败，请重新登录';
      onError(new Error(errorMessage));
    } else if (error.response?.status === 403) {
      console.error('权限不足：无法上传图片');
      const errorMessage = error.response.data?.message || '权限不足，无法上传图片';
      onError(new Error(errorMessage));
    } else {
      // 上传失败后调用error回调
      onError(error);
    }
  }
}

const removeImage = () => {
  formData.imageUrl = '';
  formData.imagePreview = '';
};

// 上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB!')
    return false
  }
  return true
}

// 自定义替换上传方法
const customReplaceUpload = async (options) => {
  const { file } = options
  replaceFormData.newImageFile = file
  return Promise.resolve()
}

// 处理新增
const handleAdd = () => {
  Object.assign(formData, {
    _id: '',
    title: '',
    imageUrl: '',
    imageFile: null,
    imagePreview: '',
    linkUrl: '',
    sortOrder: 0,
    status: 'active'
  })
  // 更新上传头部信息
  uploadHeaders.Authorization = `Bearer ${localStorage.getItem('token')}`
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  Object.assign(formData, {
    ...row,
    imageUrl: row.imageUrl || '',
    imagePreview: row.imageUrl || ''
  })
  // 更新上传头部信息
  uploadHeaders.Authorization = `Bearer ${localStorage.getItem('token')}`
  dialogVisible.value = true
}

// 处理替换
const handleReplace = (row) => {
  Object.assign(replaceFormData, {
    carouselId: row._id,
    newImageFile: null
  })
  replaceDialogVisible.value = true
}

// 处理替换提交
const handleReplaceSubmit = async () => {
  if (!replaceFormData.newImageFile) {
    ElMessage.error('请先选择要上传的图片')
    return
  }

  replaceSubmitting.value = true
  try {
    const formDataUpload = new FormData()
    formDataUpload.append('image', replaceFormData.newImageFile)
    
    await updateCarousel(replaceFormData.carouselId, formDataUpload)
    
    ElMessage.success('替换成功')
    replaceDialogVisible.value = false
    loadCarousels()
  } catch (error) {
    console.error('替换失败:', error)
    ElMessage.error('替换失败: ' + (error.response?.data?.message || error.message))
  } finally {
    replaceSubmitting.value = false
  }
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该轮播图吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCarousel(row._id)
      ElMessage.success('删除成功')
      loadCarousels()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败: ' + (error.response?.data?.message || error.message))
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      let response
      
      // 创建提交数据对象，类似商品管理页面
      const submitData = {
        title: formData.title,
        linkUrl: formData.linkUrl,
        sortOrder: formData.sortOrder,
        status: formData.status,
        imageUrl: formData.imageUrl  // 添加图片URL到提交数据
      }

      if (formData._id) {
        // 更新轮播图
        response = await updateCarousel(formData._id, submitData)
        ElMessage.success('更新成功')
      } else {
        // 创建新轮播图
        response = await createCarousel(submitData)
        ElMessage.success('创建成功')
      }
      
      dialogVisible.value = false
      loadCarousels()
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error('操作失败: ' + (error.response?.data?.message || error.message))
    } finally {
      submitting.value = false
    }
  })
}

// 分页处理
const handleSizeChange = (size) => {
  filters.limit = size
  loadCarousels()
}

const handleCurrentChange = (page) => {
  filters.page = page
  loadCarousels()
}

onMounted(() => {
  // 检查用户是否已登录
  if (!userStore.token) {
    ElMessage.error('请先登录')
    setTimeout(() => {
      window.location.href = '/login'
    }, 1000)
  } else {
    // 验证token是否有效并获取用户信息
    userStore.getCurrentUser().then(() => {
      // token有效，加载轮播图数据
      loadCarousels()
    }).catch(error => {
      console.error('验证用户信息失败:', error)
      ElMessage.error('登录已过期，请重新登录')
      userStore.logout()
    })
  }
})
</script>

<style lang="scss" scoped>
.carousel-management {
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

  .table-card {
    margin-bottom: 20px;
  }

  .carousel-image {
    width: 100px;
    height: 60px;
    border-radius: 4px;
  }

  .image-uploader {
    .image-preview {
      position: relative;
      display: inline-block;

      .preview-image {
        max-width: 100px;
        max-height: 100px;
        width: auto;
        height: auto;
        border-radius: 8px;
        object-fit: contain;
        display: block;
        margin: 0 auto;
        overflow: hidden;
        box-sizing: border-box;
        border: 1px solid #e0e6ed;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        // 确保样式应用到 el-image 组件
        &::v-deep(.el-image__inner) {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          width: auto;
          height: auto;
        }
      }

      .upload-actions {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;

        &:hover {
          opacity: 1;
        }
      }
    }

    .upload-tips {
      font-size: 12px;
      color: #999;
      margin-top: 5px;
    }
  }
}
</style>