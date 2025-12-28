<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="用户名" prop="username">
      <el-input v-model="formData.username" placeholder="请输入用户名" />
    </el-form-item>

    <el-form-item label="邮箱" prop="email">
      <el-input v-model="formData.email" placeholder="请输入邮箱" />
    </el-form-item>

    <el-form-item v-if="!isEdit" label="密码" prop="password">
      <el-input
        v-model="formData.password"
        type="password"
        placeholder="请输入密码"
        show-password
      />
    </el-form-item>

    <el-form-item label="手机号" prop="phone">
      <el-input v-model="formData.phone" placeholder="请输入手机号" />
    </el-form-item>

    <el-form-item label="部门">
      <el-input v-model="formData.department" placeholder="请输入部门" />
    </el-form-item>

    <el-form-item label="角色" prop="role">
      <el-select v-model="formData.role" placeholder="请选择角色">
        <el-option
          v-for="role in roles"
          :key="role._id"
          :label="role.displayName"
          :value="role._id"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="状态">
      <el-radio-group v-model="formData.status">
        <el-radio label="active">激活</el-radio>
        <el-radio label="inactive">停用</el-radio>
        <el-radio label="suspended">封禁</el-radio>
        <el-radio label="pending">待审核</el-radio>
        <el-radio label="rejected">已拒绝</el-radio>
      </el-radio-group>
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
  user: {
    type: Object,
    default: null
  },
  roles: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref(null)
const isEdit = computed(() => !!props.user)

const formData = reactive({
  username: props.user?.username || '',
  email: props.user?.email || '',
  password: '',
  phone: props.user?.phone || '',
  department: props.user?.department || '',
  role: props.user?.role?._id || '',
  status: props.user?.status || 'active'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 30, message: '长度在 3 到 30 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: !isEdit.value, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const handleSubmit = async () => {
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', formData)
    }
  })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
