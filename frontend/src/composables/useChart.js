import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useChart() {
    const chartRef = ref(null)
    const chartInstance = ref(null)

    const initChart = (option) => {
        if (!chartRef.value) return
        // ECharts 实例初始化逻辑
        // chartInstance.value = echarts.init(chartRef.value)
        // chartInstance.value.setOption(option)
    }

    const updateChart = (option) => {
        if (!chartInstance.value) return
        chartInstance.value.setOption(option)
    }

    const resizeChart = () => {
        if (!chartInstance.value) return
        chartInstance.value.resize()
    }

    onMounted(() => {
        window.addEventListener('resize', resizeChart)
    })

    onUnmounted(() => {
        window.removeEventListener('resize', resizeChart)
        if (chartInstance.value) {
            chartInstance.value.dispose()
        }
    })

    return {
        chartRef,
        chartInstance,
        initChart,
        updateChart,
        resizeChart
    }
}