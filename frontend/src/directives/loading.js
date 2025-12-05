export default {
    mounted(el, binding) {
        const { value } = binding
        if (value) {
            addLoading(el)
        }
    },
    updated(el, binding) {
        const { value, oldValue } = binding
        if (value !== oldValue) {
            value ? addLoading(el) : removeLoading(el)
        }
    }
}

function addLoading(el) {
    const mask = document.createElement('div')
    mask.className = 'loading-mask'
    mask.innerHTML = `
    <div class="loading-spinner">
      <i class="el-icon-loading"></i>
      <span>加载中...</span>
    </div>
  `
    el.style.position = 'relative'
    el.appendChild(mask)
}

function removeLoading(el) {
    const mask = el.querySelector('.loading-mask')
    if (mask) {
        mask.remove()
    }
}