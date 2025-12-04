<template>
  <div class="ai-assistant">
    <el-card class="ai-card" shadow="always">
      <template #header>
        <div class="ai-header">
          <h1>🤖 AI 智能助手</h1>
          <el-segmented v-model="activeTab" :options="tabOptions" />
        </div>
      </template>

      <!-- 对话模式 -->
      <div v-if="activeTab === 'chat'" class="chat-container">
        <div ref="messagesRef" class="messages-area">
          <div
              v-for="(msg, index) in messages"
              :key="index"
              :class="['message', msg.type]"
          >
            <div class="message-avatar">
              {{ msg.type === 'user' ? '👤' : '🤖' }}
            </div>
            <div class="message-content">
              <div class="message-text">{{ msg.content }}</div>
              <div class="message-time">
                {{ dayjs(msg.timestamp).format('HH:mm:ss') }}
              </div>
            </div>
          </div>

          <div v-if="loading" class="message assistant">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="quick-actions">
          <el-button
              v-for="action in quickActions"
              :key="action.key"
              size="small"
              @click="handleQuickAction(action.key)"
          >
            {{ action.label }}
          </el-button>
        </div>

        <div class="input-area">
          <el-input
              v-model="inputMessage"
              placeholder="输入您的问题..."
              :disabled="loading"
              @keyup.enter="handleSend"
          >
            <template #append>
              <el-button
                  :icon="Promotion"
                  :loading="loading"
                  @click="handleSend"
              >
                发送
              </el-button>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 工具模式 -->
      <div v-else class="tools-container">
        <el-row :gutter="20">
          <el-col
              v-for="tool in aiTools"
              :key="tool.key"
              :xs="24"
              :sm="12"
              :lg="8"
          >
            <div class="tool-card" @click="handleToolClick(tool)">
              <div class="tool-icon">{{ tool.icon }}</div>
              <h3 class="tool-title">{{ tool.title }}</h3>
              <p class="tool-description">{{ tool.description }}</p>
              <el-button type="primary" class="tool-button">
                使用工具 →
              </el-button>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { Promotion } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { aiAPI } from '@/utils/request'

const activeTab = ref('chat')
const tabOptions = [
  { label: '💬 对话', value: 'chat' },
  { label: '🛠️ 工具', value: 'tools' }
]

const messages = ref([
  {
    type: 'assistant',
    content: '您好！我是AI智能助手，可以帮您分析数据、生成报告、推荐商品等。请问有什么可以帮您的吗？',
    timestamp: new Date()
  }
])

const inputMessage = ref('')
const loading = ref(false)
const messagesRef = ref(null)

const quickActions = [
  { key: 'analyze', label: '📊 数据分析' },
  { key: 'report', label: '📝 生成报告' },
  { key: 'predict', label: '🔮 销量预测' },
  { key: 'recommend', label: '💡 商品推荐' }
]

const aiTools = [
  {
    key: 'analyze',
    icon: '📊',
    title: '智能数据分析',
    description: '自动分析销售、用户、商品等数据，生成可视化报告'
  },
  {
    key: 'report',
    icon: '📝',
    title: '自动报告生成',
    description: '一键生成日报、周报、月报等运营报告'
  },
  {
    key: 'predict',
    icon: '🔮',
    title: '销量预测',
    description: '基于历史数据预测商品未来销量趋势'
  },
  {
    key: 'recommend',
    icon: '💡',
    title: '商品推荐',
    description: '基于用户行为推荐相关商品'
  },
  {
    key: 'image',
    icon: '🔍',
    title: '图像识别',
    description: '识别商品图片并自动分类标注'
  },
  {
    key: 'insight',
    icon: '📈',
    title: '趋势洞察',
    description: '发现数据中的隐藏趋势和商机'
  }
]

const handleSend = async () => {
  if (!inputMessage.value.trim() || loading.value) return

  const userMessage = {
    type: 'user',
    content: inputMessage.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  inputMessage.value = ''
  loading.value = true

  scrollToBottom()

  try {
    const { data } = await aiAPI.chat(userMessage.content)
    messages.value.push({
      type: 'assistant',
      content: data.response,
      timestamp: new Date()
    })
  } catch (error) {
    messages.value.push({
      type: 'error',
      content: '抱歉，AI服务暂时不可用，请稍后再试。',
      timestamp: new Date()
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

const handleQuickAction = async (action) => {
  loading.value = true
  try {
    let response
    switch (action) {
      case 'analyze':
        response = await aiAPI.analyzeData('sales', '30days')
        messages.value.push({
          type: 'assistant',
          content: `数据分析报告：\n\n${response.data.analysis}`,
          timestamp: new Date()
        })
        break
      case 'report':
        response = await aiAPI.generateReport('月度运营报告', '30days')
        messages.value.push({
          type: 'assistant',
          content: response.data.report,
          timestamp: new Date()
        })
        break
      case 'predict':
        messages.value.push({
          type: 'assistant',
          content: '请提供商品ID，我将为您预测未来7天的销量。',
          timestamp: new Date()
        })
        break
      case 'recommend':
        response = await aiAPI.recommendProducts()
        const recommendations = response.data.recommendations
            .map(rec => `• ${rec.product.name} - ${rec.reason}`)
            .join('\n')
        messages.value.push({
          type: 'assistant',
          content: `为您推荐以下商品：\n\n${recommendations}`,
          timestamp: new Date()
        })
        break
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

const handleToolClick = (tool) => {
  activeTab.value = 'chat'
  handleQuickAction(tool.key)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}
</script>

<style lang="scss" scoped>
.ai-assistant {
  .ai-card {
    min-height: calc(100vh - 200px);

    :deep(.el-card__header) {
      padding: 20px;
    }

    :deep(.el-card__body) {
      padding: 0;
      height: calc(100vh - 300px);
    }
  }

  .ai-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h1 {
      margin: 0;
      font-size: 24px;
    }
  }

  .chat-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .messages-area {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    background: #f8f9fa;
  }

  .message {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    animation: slideIn 0.3s;

    &.user {
      flex-direction: row-reverse;

      .message-text {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
    }

    &.error .message-text {
      background: #ffebee;
      color: #c33;
    }

    .message-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .message-content {
      flex: 1;
      max-width: 70%;
    }

    .message-text {
      background: white;
      padding: 14px 18px;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      white-space: pre-wrap;
      line-height: 1.6;
    }

    .message-time {
      font-size: 11px;
      color: #999;
      margin-top: 4px;
      padding: 0 4px;
    }
  }

  .typing-indicator {
    display: flex;
    gap: 6px;
    padding: 14px 18px;
    background: white;
    border-radius: 16px;
    width: fit-content;

    span {
      width: 8px;
      height: 8px;
      background: #667eea;
      border-radius: 50%;
      animation: bounce 1.4s infinite;

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }

  .quick-actions {
    padding: 16px 24px;
    border-top: 1px solid #e0e6ed;
    border-bottom: 1px solid #e0e6ed;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .input-area {
    padding: 20px 24px;
    background: white;
  }

  .tools-container {
    padding: 40px;
    height: 100%;
    overflow-y: auto;
  }

  .tool-card {
    background: white;
    border: 2px solid #e0e6ed;
    border-radius: 16px;
    padding: 32px;
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
    margin-bottom: 20px;

    &:hover {
      border-color: #667eea;
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
    }

    .tool-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .tool-title {
      font-size: 20px;
      color: #2c3e50;
      margin-bottom: 12px;
    }

    .tool-description {
      color: #7f8c8d;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .tool-button {
      width: 100%;
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
}
</style>