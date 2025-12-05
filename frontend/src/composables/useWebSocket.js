import { ref, onMounted, onUnmounted } from 'vue'

export function useWebSocket(url) {
    const ws = ref(null)
    const isConnected = ref(false)
    const messages = ref([])

    const connect = () => {
        ws.value = new WebSocket(url)

        ws.value.onopen = () => {
            isConnected.value = true
            console.log('WebSocket connected')
        }

        ws.value.onmessage = (event) => {
            const data = JSON.parse(event.data)
            messages.value.push(data)
        }

        ws.value.onerror = (error) => {
            console.error('WebSocket error:', error)
        }

        ws.value.onclose = () => {
            isConnected.value = false
            console.log('WebSocket disconnected')
            // 自动重连
            setTimeout(connect, 3000)
        }
    }

    const send = (data) => {
        if (ws.value && isConnected.value) {
            ws.value.send(JSON.stringify(data))
        }
    }

    const close = () => {
        if (ws.value) {
            ws.value.close()
        }
    }

    onMounted(() => {
        connect()
    })

    onUnmounted(() => {
        close()
    })

    return {
        isConnected,
        messages,
        send,
        close
    }
}
