export default {
    mounted(el, binding) {
        const { value, arg } = binding
        const delay = parseInt(arg) || 300

        let timer = null
        el.addEventListener('click', () => {
            if (timer) {
                clearTimeout(timer)
            }
            timer = setTimeout(() => {
                value()
            }, delay)
        })
    }
}