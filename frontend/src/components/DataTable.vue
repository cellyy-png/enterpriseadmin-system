<template>
  <div class="data-table-component">
    <el-table
      v-loading="loading"
      :data="data"
      stripe
      border
      v-bind="$attrs"
    >
      <slot></slot>
    </el-table>

    <el-pagination
      v-if="pagination"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="pagination.total"
      :page-sizes="pageSizes"
      :layout="layout"
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    default: null
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  }
})

const emit = defineEmits(['page-change', 'size-change'])

const currentPage = ref(props.pagination?.page || 1)
const pageSize = ref(props.pagination?.limit || 10)

watch(
  () => props.pagination,
  (newVal) => {
    if (newVal) {
      currentPage.value = newVal.page
      pageSize.value = newVal.limit
    }
  },
  { deep: true }
)

const handlePageChange = (page) => {
  emit('page-change', page)
}

const handleSizeChange = (size) => {
  emit('size-change', size)
}
</script>

<style lang="scss" scoped>
.data-table-component {
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
