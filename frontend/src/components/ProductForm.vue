<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="100px"
  >
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入商品名称" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="SKU" prop="sku">
          <el-input v-model="formData.sku" placeholder="请输入SKU" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="商品描述">
      <el-input
        v-model="formData.description"
        type="textarea"
        :rows="4"
        placeholder="请输入商品描述"
      />
    </el-form-item>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="价格" prop="price">
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
          <el-select v-model="formData.category" placeholder="请选择分类">
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
          <el-select v-model="formData.status">
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
        placeholder="多个标签用逗号分隔"
      />
    </el-form-item>

    <el-form-item label="商品图片">
      <el-input v-model="formData.images" placeholder="图片URL" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">
        {{ isEdit ? '更新' : '创建' }}
      </el-button>
      <el-button @click="handleCancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref(null)
const isEdit = computed(() => !!props.product)

const formData = reactive({
  name: props.product?.name || '',
  sku: props.product?.sku || '',
  description: props.product?.description || '',
  price: props.product?.price || 0,
  originalPrice: props.product?.originalPrice || 0,
  stock: props.product?.stock || 0,
  category: props.product?.category?._id || '',
  status: props.product?.status || 'active',
  tags: props.product?.tags?.join(', ') || '',
  images: props.product?.images?.[0] || ''
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  sku: [{ required: true, message: '请输入SKU', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

const handleSubmit = async () => {
  await formRef.value.validate((valid) => {
    if (valid) {
      const data = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        images: formData.images ? [formData.images] : []
      }
      emit('submit', data)
    }
  })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
